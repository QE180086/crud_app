'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

type CartItem = {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
};

export default function OrderPage() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const email = localStorage.getItem('userEmail');
        if (!email) return router.push('/');
        setUserId(email);
        fetchCart(email);
    }, []);

    const fetchCart = async (email: string) => {
        try {
            const res = await axios.get(`/api/cart?userId=${email}`);
            setCart(res.data?.products || []);
        } catch (error) {
            console.error('Lỗi tải giỏ hàng:', error);
        }
    };

    const handlePlaceOrder = async () => {
        if (!userId) return;

        setLoading(true);
        try {
            const res = await axios.post('/api/orders', { userId });

            alert('Đặt hàng thành công!');
            router.push('/'); // hoặc về trang chủ
        } catch (error) {
            console.error('Lỗi khi đặt hàng:', error);
            alert('Đặt hàng thất bại.');
        } finally {
            setLoading(false);
        }
    };

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Xác nhận đơn hàng</h1>
            {cart.length === 0 ? (
                <p className="text-gray-500">Không có sản phẩm trong giỏ hàng.</p>
            ) : (
                <>
                    <ul className="space-y-3">
                        {cart.map((item) => (
                            <li
                                key={item.productId}
                                className="flex items-center border rounded p-3 shadow-sm"
                            >
                                {item.image && (
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-16 h-16 object-cover rounded mr-4"
                                    />
                                )}
                                <div className="flex-1">
                                    <h3 className="font-semibold">{item.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        {item.quantity} x {item.price.toLocaleString('vi-VN')}₫
                                    </p>
                                </div>
                                <span className="font-bold text-blue-600">
                                    {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                                </span>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-6 flex justify-between items-center">
                        <p className="text-lg font-bold">
                            Tổng cộng: <span className="text-red-600">{total.toLocaleString('vi-VN')}₫</span>
                        </p>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => router.push('/')}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                                Huỷ
                            </button>
                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading}
                                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                {loading ? 'Đang đặt hàng...' : 'Xác nhận đặt hàng'}
                            </button>
                        </div>
                    </div>

                </>
            )}
        </div>
    );
}
