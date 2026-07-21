import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navbar from './components/layout/Navbar';

// Pages
import BookList from './pages/BookList';
import BookDetail from './pages/BookDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Favorites from './pages/Favorites';
import AdminBooks from './pages/admin/Books';
import AdminCategories from './pages/admin/Categories';
import AdminReports from './pages/admin/Reports';

// Layout wrapper for public pages (with top navbar)
function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <BookList />
              </PublicLayout>
            }
          />
          <Route
            path="/books/:id"
            element={
              <PublicLayout>
                <BookDetail />
              </PublicLayout>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User protected */}
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <PublicLayout>
                  <Favorites />
                </PublicLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin protected */}
          <Route
            path="/admin"
            element={<Navigate to="/admin/reports" replace />}
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute adminOnly>
                <AdminReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/books"
            element={
              <ProtectedRoute adminOnly>
                <AdminBooks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute adminOnly>
                <AdminCategories />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
