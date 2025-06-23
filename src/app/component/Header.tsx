'use client';

import React, { useEffect, useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { useRouter } from "next/navigation";
import axios from "axios";
import { TrashIcon } from "@heroicons/react/24/outline";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

const Header = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const router = useRouter();

  const handleDeleteItem = async (productId: string) => {
    try {
      const res = await axios.delete(`/api/cart?userId=${userEmail}&productId=${productId}`);
      setCart(res.data?.products || []);
    } catch (err) {
      console.error("Lỗi khi xoá sản phẩm:", err);
    }
  };

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      const updatedProduct = cart.find((p) => p.productId === productId);
      if (!updatedProduct) return;

      await axios.post("/api/cart", {
        userId: userEmail,
        product: {
          productId,
          name: updatedProduct.name,
          price: updatedProduct.price,
          quantity: newQuantity - updatedProduct.quantity,
          image: updatedProduct.image
        },
      });

      // Gọi lại cart để reload dữ liệu mới
      fetchCart(userEmail!);
    } catch (err) {
      console.error("Lỗi khi cập nhật số lượng:", err);
    }
  };

  // Load userEmail từ localStorage
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) {
      setUserEmail(email);
      fetchCart(email);
    }
  }, []);

  const fetchCart = async (email: string) => {
    try {
      const res = await axios.get(`/api/cart?userId=${email}`);
      setCart(res.data?.products || []);
    } catch (err) {
      console.error("Failed to fetch cart", err);
    }
  };
  const refreshCart = () => {
    const email = localStorage.getItem("userEmail");
    if (email) fetchCart(email);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setUserEmail(null);
    setCart([]);
    window.location.reload();
  };

  const handleLoginSuccess = () => {
    const email = localStorage.getItem("userEmail");
    if (email) {
      setUserEmail(email);
      fetchCart(email);
    }
  };
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) setUserEmail(email);

    const handleCartUpdated = () => {
      if (email) fetchCart(email);
    };

    window.addEventListener("cart-updated", handleCartUpdated);
    return () => window.removeEventListener("cart-updated", handleCartUpdated);
  }, []);

  return (
    <>
      <header className="flex justify-between items-center mb-6 py-4 border-b px-6 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Management Product</h1>
        <div className="flex items-center space-x-4 relative">
          {/* Icon giỏ hàng */}
          {userEmail && (
            <button onClick={() => setShowCartPopup(!showCartPopup)} className="relative">
              <svg
                className="w-7 h-7 text-gray-700 hover:text-blue-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m13-9l2 9M9 21h6"
                />
              </svg>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
                  {cart.length}
                </span>
              )}
            </button>
          )}

          {/* Login / Register */}
          {userEmail ? (
            <>
              <span className="text-green-700 font-semibold">Xin chào, {userEmail}</span>
              <button
                onClick={() => router.push("/order/history")}
                className="text-blue-600 hover:underline font-medium"
              >
                Lịch sử mua hàng
              </button>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:underline font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowLogin(true)}
                className="text-blue-600 hover:underline font-medium"
              >
                Login
              </button>
              <button
                onClick={() => setShowRegister(true)}
                className="text-blue-600 hover:underline font-medium"
              >
                Register
              </button>
            </>
          )}
        </div>
      </header>

      {/* Popup giỏ hàng */}
      {showCartPopup && (
        <div className="absolute right-6 top-20 z-50 w-72 bg-white shadow-lg border rounded p-4">
          <h3 className="font-bold text-lg mb-2">Giỏ hàng</h3>
          {cart.length === 0 ? (
            <p className="text-gray-500">Chưa có sản phẩm.</p>
          ) : (
            <>
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <li key={item.productId} className="border-b pb-2">
                    <div className="flex items-start space-x-2">
                      {/* Hình ảnh */}
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded object-cover border"
                        />
                      )}

                      {/* Thông tin sản phẩm */}
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-800">{item.name}</span>
                          <button
                            onClick={() => handleDeleteItem(item.productId)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Xoá sản phẩm"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex items-center mt-1 space-x-2">
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(item.productId, +e.target.value)
                            }
                            className="w-14 text-sm border rounded px-2 py-1 text-center"
                          />
                          <span className="text-sm text-gray-600">
                            x {item.price.toLocaleString()}₫
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>


              <div className="flex justify-between mt-4 font-semibold text-gray-800 border-t pt-2">
                <span>Tổng cộng:</span>
                <span>{totalPrice.toLocaleString()}₫</span>
              </div>

              <button
                onClick={() => {
                  setShowCartPopup(false);
                  router.push("/order");
                }}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
              >
                Đặt hàng
              </button>
            </>
          )}
        </div>
      )}

      {/* Login & Register Form */}
      {showRegister && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/20 z-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
              onClick={() => setShowRegister(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">Đăng ký tài khoản</h2>
            <RegisterForm onClose={() => setShowRegister(false)} />
          </div>
        </div>
      )}

      {showLogin && (
        <LoginForm
          onClose={() => setShowLogin(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
};

export default Header;
