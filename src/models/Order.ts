import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  products: [
    {
      productId: String,
      name: String,
      quantity: Number,
      price: Number,
      image: String,
    },
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: "pending" },
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
