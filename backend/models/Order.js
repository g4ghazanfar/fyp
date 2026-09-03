const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    mealId: { type: mongoose.Schema.Types.ObjectId, ref: "Meal", required: false },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: { type: [orderItemSchema], required: true, validate: v => v.length > 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ["easypaisa", "jazzcash"], default: "easypaisa" },
    status: {
      type: String,
      enum: ["placed", "confirmed", "preparing", "picked_up", "on_way", "delivered"],
      default: "placed",
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);