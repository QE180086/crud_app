import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/Mongoose';
import mongoose from 'mongoose';
import { Product } from '@/models/Product';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Kiểm tra ID có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Tìm sản phẩm theo ID
    const product = await Product.findById(params.id);

    // Nếu không tìm thấy sản phẩm
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product
    });

  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get product detail',
        details: error.message 
      },
      { status: 500 }
    );
  }
}


export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Kiểm tra dữ liệu đầu vào
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No data provided' },
        { status: 400 }
      );
    }

    // Cập nhật sản phẩm (new: true để trả về document sau khi update)
    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedProduct
    });

  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update product',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE - Xóa sản phẩm
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const deletedProduct = await Product.findByIdAndDelete(params.id);

    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
      deletedId: params.id
    });

  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete product',
        details: error.message 
      },
      { status: 500 }
    );
  }
}