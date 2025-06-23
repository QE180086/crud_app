'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TrashIcon, PencilIcon, EyeIcon } from '@heroicons/react/24/outline';
import Header from './component/Header';

interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  image?: string;
}

export default function ProductManagement() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: '', description: '', price: '', image: null as File | null });
  const [editForm, setEditForm] = useState({ name: '', description: '', price: '' });
  const [name, setName] = useState('');
  const [sort, setSort] = useState('price');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [page, name, sort, order]);

  const fetchProducts = async () => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      name,
      sort,
      order,
    });

    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();

    if (data.success) {
      setProducts(data.data);
      setTotalPages(data.pagination.totalPages);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setForm({ ...form, image: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = '';

    if (form.image) {
      const cloudForm = new FormData();
      cloudForm.append('file', form.image);
      cloudForm.append('upload_preset', 'UploadAnh');
      const cloudRes = await fetch('https://api.cloudinary.com/v1_1/dsenbweg2/image/upload', {
        method: 'POST',
        body: cloudForm,
      });

      const cloudData = await cloudRes.json();

      if (cloudRes.ok) {
        imageUrl = cloudData.secure_url;
      } else {
        console.error('Upload error', cloudData);
        alert('Upload ảnh thất bại!');
        return;
      }
    }

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        price: form.price,
        image: imageUrl,
      }),
    });

    if (res.ok) {
      setForm({ name: '', description: '', price: '', image: null });
      fetchProducts();
    }
  };

const handleAddToCart = async (product: any) => {
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) {
    alert("Bạn cần đăng nhập để thêm vào giỏ hàng.");
    return;
  }

  try {
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userEmail,
        product: {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image || '', 
        },
      }),
    });
window.dispatchEvent(new CustomEvent("cart-updated"));
    alert(" Đã thêm vào giỏ hàng!");
  } catch (error) {
    console.error("Lỗi khi thêm vào giỏ hàng", error);
    alert(" Thêm vào giỏ hàng thất bại.");
  }
};



  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct?._id) return;

    const res = await fetch(`/api/products/${selectedProduct._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editForm.name,
        description: editForm.description,
        price: Number(editForm.price),
      }),
    });

    if (res.ok) {
      setShowEditModal(false);
      setEditForm({ name: '', description: '', price: '' });
      setSelectedProduct(null);
      fetchProducts();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      setIsDeleting(true);
      try {
        const res = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          fetchProducts();
        }
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleViewDetail = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
    });
    setShowEditModal(true);
  };
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const token = localStorage?.getItem("token");
    setIsLoggedIn(!!token);
  }, []);
  return (

    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <Header />
      {/* Modal xem chi tiết sản phẩm */}
      {showDetailModal && selectedProduct && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">Chi tiết sản phẩm</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {selectedProduct.image && (
                <div className="flex justify-center">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="h-48 object-cover rounded-md"
                  />
                </div>
              )}

              <div>
                <h4 className="text-lg font-semibold">Tên sản phẩm</h4>
                <p className="text-gray-700">{selectedProduct.name}</p>
              </div>

              <div>
                <h4 className="text-lg font-semibold">Mô tả</h4>
                <p className="text-gray-700 whitespace-pre-line">{selectedProduct.description}</p>
              </div>

              <div>
                <h4 className="text-lg font-semibold">Giá</h4>
                <p className="text-blue-600 font-bold">
                  {new Intl.NumberFormat('vi-VN').format(selectedProduct.price)} đ
                </p>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa sản phẩm */}
      {isLoggedIn && showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">Chỉnh sửa sản phẩm</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  required
                  min="0"
                />
              </div>
              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Quản lý Sản phẩm</h1>
        {isLoggedIn && (
          <>
            {/* Form thêm sản phẩm */}
            < div className="bg-blue-50 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">Thêm sản phẩm mới</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                    <input
                      type="text"
                      placeholder="Nhập tên sản phẩm"
                      className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                    <input
                      type="text"
                      placeholder="Nhập mô tả"
                      className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ)</label>
                    <input
                      type="number"
                      placeholder="Nhập giá"
                      className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh sản phẩm</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow transition duration-200"
                >
                  Thêm sản phẩm
                </button>
              </form>
            </div>
          </>
        )}

        {/* Hiển thị cảnh báo nếu không có sản phẩm */}
        {/* Bộ lọc và sắp xếp */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Tìm kiếm & Sắp xếp</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm theo tên</label>
              <input
                type="text"
                placeholder="Nhập tên sản phẩm..."
                className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sắp xếp theo</label>
              <select
                className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="price">Giá</option>
                <option value="name">Tên</option>
              </select>
            </div>
            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự</label>
              <select
                className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={order}
                onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
              >
                <option value="asc">Tăng dần</option>
                <option value="desc">Giảm dần</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên sản phẩm
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mô tả
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá (VNĐ)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
  {products.map((product) => (
    <tr key={product._id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-medium text-gray-900">{product.name}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-gray-500 line-clamp-2">{product.description}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="font-semibold text-blue-600">
          {new Intl.NumberFormat('vi-VN').format(product.price)} đ
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewDetail(product)}
            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
            title="Xem chi tiết"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
          {isLoggedIn && (
            <>
              <button
                onClick={() => handleEditClick(product)}
                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                title="Chỉnh sửa"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => product._id && handleDelete(product._id)}
                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                title="Xóa"
                disabled={isDeleting}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleAddToCart(product)}
                className="text-yellow-600 hover:text-yellow-800 p-1 rounded hover:bg-yellow-50"
                title="Thêm vào giỏ hàng"
              >
                🛒
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  ))}
</tbody>

          </table>
        </div>

        {/* Phân trang */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-700">
            Hiển thị <span className="font-medium">{(page - 1) * limit + 1}</span> đến{' '}
            <span className="font-medium">{Math.min(page * limit, (page - 1) * limit + products.length)}</span> trong tổng số{' '}
            <span className="font-medium">{totalPages * limit}</span> sản phẩm
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tiếp
            </button>
          </div>
        </div>
      </div>
    </div >
  );
}
