'use client';

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid'

interface Product {
  _id: string
  name: string
  description: string
  price: number
  image: string
  __v: number
}

export default function ProductDetail() {
  const router = useRouter()
  const params = useParams()
 const id = params.id
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return

    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`)
        const data = await response.json()
        
        if (data.success) {
          setProduct(data.data)
          
          // Kiểm tra giá âm
          if (data.data.price < 0) {
            setError('Giá sản phẩm không hợp lệ (giá âm)')
          }
        } else {
          setError(data.error || 'Failed to fetch product')
        }
      } catch (err) {
        setError('Network error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-error max-w-md mx-auto mt-8">
        <ExclamationTriangleIcon className="h-6 w-6" />
        <span>{error}</span>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="alert alert-warning max-w-md mx-auto mt-8">
        <span>Không tìm thấy sản phẩm</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Hiển thị cảnh báo nếu giá âm */}
        {product.price < 0 && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              <p>Cảnh báo: Giá sản phẩm là số âm không hợp lệ</p>
            </div>
          </div>
        )}

        <div className="md:flex">
          <div className="md:flex-shrink-0">
            <img
              className="h-48 w-full object-cover md:w-48"
              src={product.image || '/placeholder-product.jpg'}
              alt={product.name}
            />
          </div>
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
              Chi tiết sản phẩm
            </div>
            <h1 className="block mt-1 text-lg leading-tight font-medium text-black">
              {product.name}
            </h1>
            <p className="mt-2 text-gray-500">{product.description}</p>
            
            <div className={`mt-4 text-2xl font-bold ${
              product.price < 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {product.price < 0 ? (
                <span className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-1" />
                  {product.price.toLocaleString()}đ (Không hợp lệ)
                </span>
              ) : (
                product.price.toLocaleString() + 'đ'
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => router.push(`/${product._id}/edit`)}
                className="btn btn-primary mr-2"
              >
                Chỉnh sửa
              </button>
              <button
                onClick={() => router.back()}
                className="btn btn-outline"
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}