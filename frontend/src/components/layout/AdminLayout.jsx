import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'Dashboard', path: '/admin/reports' },
  { label: 'Books', path: '/admin/books' },
  { label: 'Categories', path: '/admin/categories' },
  { label: 'Reports', path: '/admin/reports' },
];

export default function AdminLayout({ children }) {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-48 bg-gray-900 text-white flex flex-col py-6 px-3 shrink-0">
        <div className="text-lg font-bold text-white mb-8 px-2">BookStore</div>
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="px-3 py-2 rounded-md text-sm text-gray-300 hover:bg-gray-700 hover:text-white text-left mt-4"
        >
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
