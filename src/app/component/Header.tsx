'use client';

import React, { useEffect, useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";


const Header = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) setUserEmail(email);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setUserEmail(null);
    window.location.reload();
  };

  const handleLoginSuccess = () => {
    const email = localStorage.getItem("userEmail");
    setUserEmail(email);
  };

  return (
    <>
      <header className="flex justify-between items-center mb-6 py-4 border-b px-6 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Management Product</h1>
        <div className="space-x-4">
          {userEmail ? (
            <>
              <span className="text-green-700 font-semibold">
                Xin chào, {userEmail}
              </span>
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
