import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';

function Navbar() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600">
          URL Shortener
        </Link>
        <div className="flex space-x-4">
          {token ? (
            <>
              <Link to="/" className="px-3 py-2 text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
              <Link to="/create" className="px-3 py-2 text-gray-700 hover:text-blue-600">
                Create Link
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-gray-700 hover:text-blue-600"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="px-3 py-2 text-gray-700 hover:text-blue-600">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;