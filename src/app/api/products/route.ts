// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/Mongoose';
import { Product } from '@/models/Product';

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const newProduct = await Product.create(body);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create product', details: error },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await connectDB();

    // Lấy query parameters từ URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const name = searchParams.get('name') || '';
    const sort = searchParams.get('sort') || 'price';
    const order = searchParams.get('order') || 'asc';

    // query
    const query: any = {};
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    //  sort
    const sortOptions: any = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;

    // Thực hiện query
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Product.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch products',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
