'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

type Product = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type Order = {
  _id: string;
  products: Product[];
  totalAmount: number;
  status: string;
  createdAt: string;
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
 const router = useRouter();
  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) return;
    setUserId(email);
    fetchOrders(email);
  }, []);

  const fetchOrders = async (userId: string) => {
    try {
      const res = await axios.get(`/api/orders?userId=${userId}`);
      setOrders(res.data);
    } catch (err) {
      console.error('Lỗi tải đơn hàng:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Lịch sử đơn hàng</h1>
   <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
        >
          ← Quay lại trang chủ
        </button>
      {orders.length === 0 ? (
        <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="border rounded-lg shadow-sm p-4">
              <div className="mb-2 flex justify-between items-center">
                <span className="text-gray-600 text-sm">
                  Mã đơn: <strong>{order._id}</strong>
                </span>
                <span className="text-sm text-blue-600">
                  Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>

              <ul className="space-y-2">
                {order.products.map((item) => (
                  <li key={item.productId} className="flex items-center border-b pb-2">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded mr-4"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} x {item.price.toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                    <span className="font-semibold text-right">
                      {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                    </span>
                  </li>
                ))}
              </ul>

              <div className="text-right mt-4">
                <p className="text-lg font-bold">
                  Tổng tiền:{' '}
                  <span className="text-red-600">
                    {order.totalAmount.toLocaleString('vi-VN')}₫
                  </span>
                </p>
                <p className="text-sm text-green-600">Trạng thái: {order.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
