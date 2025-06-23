import { NextRequest, NextResponse } from "next/server";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import { connectDB } from "@/lib/Mongoose";

// POST: Tạo đơn hàng từ giỏ
export async function POST(req: NextRequest) {
  await connectDB();
  const { userId } = await req.json();

  const cart = await Cart.findOne({ userId });
  if (!cart || cart.products.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const totalAmount = cart.products.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );

  const order = await Order.create({
    userId,
    products: cart.products,
    totalAmount,
    status: "paid", // hoặc "pending" nếu chờ thanh toán
  });

  // Xoá giỏ hàng sau khi đặt đơn
  await Cart.deleteOne({ userId });

  return NextResponse.json(order);
}

// GET: Lấy danh sách đơn hàng theo user ?userId=xxx
export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  const orders = await Order.find(userId ? { userId } : {});
  return NextResponse.json(orders);
}
