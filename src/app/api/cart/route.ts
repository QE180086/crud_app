import { connectDB } from "@/lib/Mongoose";
import Cart from "@/models/Cart";
import { NextRequest, NextResponse } from "next/server";

// GET: Lấy giỏ hàng theo userId ?userId=xxx
export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const cart = await Cart.findOne({ userId });
  return NextResponse.json(cart || { userId, products: [] });
}

// POST: Cập nhật giỏ hàng (thêm/xoá/cập nhật)
export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();

  const { userId, product } = body;
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({ userId, products: [product] });
  } else {
    const index = cart.products.findIndex((p: any) => p.productId === product.productId);
    if (index > -1) {
      cart.products[index].quantity += product.quantity;
      cart.products[index].name = product.name;
      cart.products[index].price = product.price;
      cart.products[index].image = product.image;
      console.log("Cập nhật sản phẩm trong giỏ hàng:", cart.products[index].image);
            console.log("Cập nhật sản phẩm trong giỏ hàng 2:", product.image);

    } else {
      cart.products.push(product);
    }
    await cart.save();
  } 

  return NextResponse.json(cart);
}

// DELETE: Xoá sản phẩm trong giỏ ?userId=xxx&productId=yyy
export async function DELETE(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const productId = searchParams.get("productId");

  const cart = await Cart.findOne({ userId });
  if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 });

  cart.products = cart.products.filter((p: any) => p.productId !== productId);
  await cart.save();

  return NextResponse.json(cart);
}
