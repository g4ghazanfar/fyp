const mongoose = require("mongoose");

const healthProfileSchema = new mongoose.Schema(
  {
    age: { type: Number, min: 1, max: 120, default: 25 },
    weight: { type: Number, min: 1, max: 500, default: 65 },
    height: { type: Number, min: 30, max: 300, default: 170 },
    gender: { type: String, enum: ["male", "female"], default: "male" },
    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active"],
      default: "moderate",
    },
    allergies: { type: [String], default: [] },
    conditions: { type: [String], default: [] },
    fitnessGoal: { type: String, default: "Maintain Weight" },
    bloodType: { type: String, default: "O+" },
    dietaryPrefs: { type: [String], default: [] },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    healthProfile: { type: healthProfileSchema, default: () => ({}) },
    points: { type: Number, default: 50 },
    streak: { type: Number, default: 1 },
    joinDate: { type: String, default: () => new Date().toISOString().slice(0, 10) },
  },
  { timestamps: true },
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);