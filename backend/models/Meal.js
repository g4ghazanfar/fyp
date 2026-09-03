const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    nameUrdu: { type: String, default: "" },
    description: { type: String, default: "" },
    price: { type: Number, default: 250 },
    image: { type: String, default: "" },
    category: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack", "drink"],
      default: "lunch",
    },
    ingredients: { type: [String], default: [] },
    instructions: { type: String, default: "" },
    calories: { type: Number, default: 400 },
    protein: { type: Number, default: 20 },
    carbs: { type: Number, default: 45 },
    fat: { type: Number, default: 15 },
    tags: { type: [String], default: [] },
    allergens: { type: [String], default: [] },
    restaurant: { type: String, default: "SmartEats Kitchen" },
    rating: { type: Number, default: 4.5 },
    reviews: { type: Number, default: 0 },
    prepTime: { type: Number, default: 25 },
    isHealthy: { type: Boolean, default: true },
    healthScore: { type: Number, default: 75 },
    suitableFor: { type: [String], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Meal || mongoose.model("Meal", mealSchema);