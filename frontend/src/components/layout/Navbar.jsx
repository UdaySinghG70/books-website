import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-blue-700 tracking-tight">
            BookStore
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors">
              All Books
            </Link>

            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <>
                    <Link to="/admin/books" className="text-gray-600 hover:text-blue-600 transition-colors">
                      Books
                    </Link>
                    <Link to="/admin/categories" className="text-gray-600 hover:text-blue-600 transition-colors">
                      Categories
                    </Link>
                    <Link to="/admin/reports" className="text-gray-600 hover:text-blue-600 transition-colors">
                      Reports
                    </Link>
                  </>
                )}
                {user.role === 'USER' && (
                  <Link to="/favorites" className="text-gray-600 hover:text-blue-600 transition-colors">
                    My Favorites
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-500 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
