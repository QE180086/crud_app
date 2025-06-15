import { connectDB } from "@/lib/Mongoose";
import { Auth } from "@/models/Auth";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { LoginSchema, RegisterSchema } from "@/lib/validation/auth.schema";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const result = LoginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    const user = await Auth.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Email không tồn tại" },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Mật khẩu không đúng" },
        { status: 401 }
      );
    }

    // Tạo JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },  
        process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

  
    // Trả về token + thông tin user
    const { password: _, ...userData } = user.toObject();
    return NextResponse.json(
      { token, user: userData },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { error: "Đăng nhập thất bại", details: error },
      { status: 500 }
    );
  }
}