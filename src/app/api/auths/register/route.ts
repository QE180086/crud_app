import { connectDB } from "@/lib/Mongoose";
import { Auth } from "@/models/Auth";
import { NextResponse } from "next/server";
import { RegisterSchema } from "@/lib/validation/auth.schema";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const result = RegisterSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password } = body;

    const existingUser = await Auth.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAuth = await Auth.create({
      name,
      email,
      password: hashedPassword,
    });

    return NextResponse.json(newAuth, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create Auth", details: error },
      { status: 500 }
    );
  }
}
