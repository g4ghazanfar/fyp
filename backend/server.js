const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
const dns = require("dns");
dns.setServers((process.env.DNS_SERVERS || "8.8.8.8,1.1.1.1").split(",").map(server => server.trim()).filter(Boolean));
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { tokenFor, publicUser, requireAuth } = require("./auth");
const User = require("./models/User");
const Meal = require("./models/Meal");
const Order = require("./models/Order");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Voice recording ko memory mein rakhta hai (disk pe save nahi karta), Groq ko forward karne ke liye
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

const activityFactors = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
const categoryDefaults = {
  Chicken: { calories: 420, protein: 30, carbs: 25, fat: 18 },
  Vegetarian: { calories: 320, protein: 14, carbs: 45, fat: 10 },
  Seafood: { calories: 360, protein: 32, carbs: 18, fat: 16 },
  Dessert: { calories: 430, protein: 6, carbs: 58, fat: 18 },
  Pasta: { calories: 480, protein: 18, carbs: 62, fat: 16 },
};

function mealDto(meal, matchReason) {
  const value = meal.toObject ? meal.toObject() : meal;
  const { _id, __v, createdAt, updatedAt, ...rest } = value;
  const healthScore = Number(rest.healthScore);
  return {
    ...rest,
    id: _id?.toString() || value.id,
    healthScore: Number.isFinite(healthScore) ? healthScore : 0,
    matchReason: matchReason || value.matchReason || "",
  };
}

function parseNutrition(product) {
  const n = product?.nutriments || {};
  const value = (keys, fallback) => {
    for (const key of keys) {
      const number = Number(n[key]);
      if (Number.isFinite(number)) return Math.round(number);
    }
    return fallback;
  };
  return {
    calories: value(["energy-kcal_100g", "energy-kcal"], null),
    protein: value(["proteins_100g", "proteins"], null),
    carbs: value(["carbohydrates_100g", "carbohydrates"], null),
    fat: value(["fat_100g", "fat"], null),
  };
}

function mealCategory(meal, sourceCategory) {
  const source = `${meal.strCategory || ""} ${sourceCategory}`.toLowerCase();
  if (source.includes("dessert")) return "snack";
  if (source.includes("breakfast")) return "breakfast";
  if (source.includes("drink")) return "drink";
  if (source.includes("dinner") || source.includes("chicken") || source.includes("seafood")) return "dinner";
  return "lunch";
}

function cardDescription(sourceMeal, sourceCategory) {
  const label = [sourceMeal.strCategory || sourceCategory, sourceMeal.strArea].filter(Boolean).join(" · ");
  if (label) return label;
  const instructions = String(sourceMeal.strInstructions || "").replace(/\s+/g, " ").trim();
  return instructions.length > 57 ? `${instructions.slice(0, 57).trimEnd()}...` : instructions;
}

function allergensFor(ingredients) {
  const source = ingredients.join(" ").toLowerCase();
  return [
    ["Peanuts", ["peanut", "groundnut"]],
    ["Gluten", ["wheat", "flour", "bread", "pasta", "couscous"]],
    ["Dairy", ["milk", "cheese", "cream", "butter", "yogurt"]],
    ["Eggs", ["egg"]],
    ["Fish", ["fish", "salmon", "tuna", "cod", "rohu"]],
  ].filter(([, terms]) => terms.some(term => source.includes(term))).map(([name]) => name);
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Upstream request failed (${response.status})`);
  return response.json();
}

async function syncMeals() {
  const categories = Object.keys(categoryDefaults);
  let synced = 0;
  for (const sourceCategory of categories) {
    const data = await fetchJson(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(sourceCategory)}`,
    );
    for (const sourceMeal of (data.meals || []).slice(0, 12)) {
      const ingredients = [];
      for (let i = 1; i <= 20; i += 1) {
        const ingredient = sourceMeal[`strIngredient${i}`]?.trim();
        const measure = sourceMeal[`strMeasure${i}`]?.trim();
        if (ingredient) ingredients.push(measure ? `${measure} ${ingredient}` : ingredient);
      }
      const defaults = categoryDefaults[sourceCategory];
      let nutrition = { calories: null, protein: null, carbs: null, fat: null };
      try {
        const query = encodeURIComponent(sourceMeal.strMeal);
        const off = await fetchJson(
          `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&json=1&page_size=1`,
          { headers: { "User-Agent": "SmartEats/1.0 (nutrition sync)" } },
        );
        nutrition = parseNutrition(off.products?.[0]);
      } catch (error) {
        console.warn(`Nutrition lookup skipped for ${sourceMeal.strMeal}: ${error.message}`);
      }
      const doc = {
        name: sourceMeal.strMeal,
        description: cardDescription(sourceMeal, sourceCategory),
        image: sourceMeal.strMealThumb || "",
        category: mealCategory(sourceMeal, sourceCategory),
        ingredients,
        instructions: sourceMeal.strInstructions || "",
        calories: nutrition.calories ?? defaults.calories,
        protein: nutrition.protein ?? defaults.protein,
        carbs: nutrition.carbs ?? defaults.carbs,
        fat: nutrition.fat ?? defaults.fat,
        allergens: allergensFor(ingredients),
        tags: [sourceCategory, ...(nutrition.protein >= 25 ? ["High Protein"] : [])],
        restaurant: "SmartEats Kitchen",
        rating: 4.5,
        reviews: 0,
        prepTime: 25,
        isHealthy: (nutrition.calories ?? defaults.calories) <= 550,
        healthScore: Math.max(50, Math.min(95, Math.round(100 - (nutrition.fat ?? defaults.fat) / 2))),
        suitableFor: [],
      };
      await Meal.findOneAndUpdate({ name: doc.name }, doc, { upsert: true, new: true, setDefaultsOnInsert: true });
      synced += 1;
    }
  }
  return synced;
}

function allergyMatch(meal, allergies) {
  const haystack = [...(meal.ingredients || []), ...(meal.allergens || []), meal.name || ""].join(" ").toLowerCase();
  return allergies.some(allergy => allergy && haystack.includes(allergy.toLowerCase()));
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

app.post("/api/auth/register", async (req, res, next) => {
  try {
    const { name, email, password, phone = "", address = "", healthProfile = {} } = req.body;
    if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
      return res.status(400).json({ error: "Name, email and a password of at least 6 characters are required" });
    }
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(409).json({ error: "An account with this email already exists" });
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: await bcrypt.hash(password, 12),
      phone,
      address,
      healthProfile,
    });
    return res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase().trim() }).select("+password");
    if (!user || !password || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    return res.json({ token: tokenFor(user), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/meals/sync", async (req, res, next) => {
  try {
    const synced = await syncMeals();
    return res.json({ synced, meals: (await Meal.find().sort({ name: 1 })).map(meal => mealDto(meal)) });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/meals", async (req, res, next) => {
  try {
    const meals = await Meal.find().sort({ name: 1 });
    return res.json({ meals: meals.map(meal => mealDto(meal)) });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/meals/recommended", async (req, res, next) => {
  try {
    const user = await User.findById(req.query.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const hp = user.healthProfile || {};
    const base = hp.gender === "female"
      ? 10 * hp.weight + 6.25 * hp.height - 5 * hp.age - 161
      : 10 * hp.weight + 6.25 * hp.height - 5 * hp.age + 5;
    const tdee = base * (activityFactors[hp.activityLevel] || activityFactors.moderate);
    const target = tdee / 4;
    const meals = await Meal.find();
    const recommended = meals
      .filter(meal => !allergyMatch(meal, hp.allergies || []))
      .map(meal => {
        const distance = Math.abs(meal.calories - target);
        const reason = meal.calories <= target
          ? `Fits your estimated ${Math.round(target)} kcal meal target`
          : `A protein-rich option near your ${Math.round(target)} kcal meal target`;
        return { meal, distance, reason };
      })
      .sort((a, b) => a.distance - b.distance)
      .map(({ meal, reason }) => mealDto(meal, reason));
    return res.json({ meals: recommended, targetCalories: Math.round(target) });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/meals/:id", async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) return res.status(404).json({ error: "Meal not found" });
    return res.json({ meal: mealDto(meal) });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/orders", requireAuth, async (req, res, next) => {
  try {
    const { items, totalPrice, paymentMethod = "easypaisa" } = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "At least one item is required" });
    const order = await Order.create({
      userId: req.userId,
      items: items.map(item => ({
        mealId: mongoose.isValidObjectId(item.mealId || item.meal?.id) ? (item.mealId || item.meal?.id) : undefined,
        name: item.name || item.meal?.name,
        quantity: Number(item.quantity),
        price: Number(item.price ?? item.meal?.price),
      })),
      totalPrice: Number(totalPrice),
      paymentMethod,
      status: "placed",
    });
    return res.status(201).json({ order: { ...order.toObject(), id: order._id.toString(), total: order.totalPrice } });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/orders/:userId", requireAuth, async (req, res, next) => {
  try {
    if (req.params.userId !== req.userId) return res.status(403).json({ error: "You can only view your own orders" });
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    return res.json({ orders: orders.map(order => ({ ...order.toObject(), id: order._id.toString(), total: order.totalPrice })) });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/ai/chat", async (req, res, next) => {
  try {
    const { message, healthProfile = {} } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: "Message is required" });
    if (!process.env.GEMINI_API_KEY || !process.env.GEMINI_MODEL) {
      return res.status(503).json({ error: "AI service is not configured" });
    }
    const prompt = [
      "You are SmartEats, a friendly food and nutrition assistant for a Pakistani food delivery app.",
      "Give practical, concise guidance. Never diagnose or replace a clinician. Respect allergies and medical conditions.",
      "Reply in the same language as the user: English or Roman Urdu. Do not use Devanagari.",
      `User health profile: ${JSON.stringify(healthProfile)}`,
      `User message: ${message.trim()}`,
    ].join("\n");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(process.env.GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
    const data = await fetchJson(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }),
    });
    const reply = data.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("").trim();
    if (!reply) return res.status(502).json({ error: "AI returned an empty response" });
    return res.json({ reply });
  } catch (error) {
    return next(error);
  }
});

// Voice Assistant ke liye — recorded audio ko Groq Whisper se text mein badalta hai
app.post("/api/ai/transcribe", upload.single("audio"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Audio file is required" });
    if (!process.env.GROQ_API_KEY) return res.status(503).json({ error: "Voice service is not configured" });

    const form = new FormData();
    form.append(
      "file",
      new Blob([req.file.buffer], { type: req.file.mimetype || "audio/m4a" }),
      req.file.originalname || "recording.m4a",
    );
    form.append("model", "whisper-large-v3");

    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: form,
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`Groq transcription failed (${response.status}): ${errText}`);
    }
    const data = await response.json();
    return res.json({ text: data.text || "" });
  } catch (error) {
    return next(error);
  }
});


app.post("/api/ai/scan-food", upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Image file is required" });
    if (!process.env.GEMINI_API_KEY || !process.env.GEMINI_MODEL) return res.status(503).json({ error: "AI service is not configured" });
    const prompt = [
      "Analyze the food or dish in this image for the SmartEats nutrition app.",
      "Return ONLY valid JSON with exactly foodName, estimatedCalories, protein, carbs, fat, confidence, and notes. No markdown.",
      "Use reasonable estimates for one visible serving. Protein, carbs, and fat are grams.",
    ].join("\n");
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(process.env.GEMINI_MODEL) + ":generateContent?key=" + encodeURIComponent(process.env.GEMINI_API_KEY);
    const data = await fetchJson(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }, { inline_data: { mime_type: req.file.mimetype || "image/jpeg", data: req.file.buffer.toString("base64") } }] }] }) });
    const raw = data.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("").trim() || "";
    const cleaned = raw.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    const parsed = JSON.parse(start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned);
    const confidence = ["high", "medium", "low"].includes(parsed.confidence) ? parsed.confidence : null;
    const numbers = [parsed.estimatedCalories, parsed.protein, parsed.carbs, parsed.fat].map(Number);
    if (!parsed.foodName || !confidence || numbers.some(number => !Number.isFinite(number))) throw new Error("Gemini returned an invalid food scan shape");
    return res.json({ foodName: String(parsed.foodName), estimatedCalories: Math.round(numbers[0]), protein: Math.round(numbers[1]), carbs: Math.round(numbers[2]), fat: Math.round(numbers[3]), confidence, notes: String(parsed.notes || "Estimates depend on the visible serving size.") });
  } catch (error) {
    console.error("Food scan failed:", error);
    if (error instanceof SyntaxError || error.message === "Gemini returned an invalid food scan shape") return res.status(502).json({ error: "Gemini returned an invalid food scan response" });
    return next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error);
  if (error.name === "ValidationError") return res.status(400).json({ error: error.message });
  return res.status(500).json({ error: "Something went wrong on the server" });
});

async function start() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not configured");
  await mongoose.connect(process.env.MONGODB_URI);
  const port = Number(process.env.PORT || 3000);
  app.listen(port, "0.0.0.0", () => console.log(`SmartEats API listening on port ${port}`));
}

if (require.main === module) {
  start().catch(error => {
    console.error("Unable to start SmartEats API:", error.message);
    process.exit(1);
  });
}

module.exports = { app, start, syncMeals };