import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/favorites');
      setFavorites(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemove = async (bookId) => {
    try {
      await api.delete(`/favorites/${bookId}`);
      setFavorites((prev) => prev.filter((b) => b.id !== bookId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Favorite Books</h1>

      {favorites.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">📚</div>
          <p className="text-lg font-medium">No favorites yet</p>
          <p className="text-sm mt-1">
            Browse{' '}
            <Link to="/" className="text-blue-600 hover:underline">
              all books
            </Link>{' '}
            and add some!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {favorites.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm flex items-center gap-4 p-4"
            >
              {/* Cover thumbnail */}
              <div className="w-14 h-20 shrink-0 bg-gradient-to-br from-blue-100 to-indigo-200 rounded overflow-hidden">
                {book.cover_image ? (
                  <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">📚</div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <Link
                  to={`/books/${book.id}`}
                  className="font-semibold text-gray-800 hover:text-blue-600 transition-colors block truncate"
                >
                  {book.title}
                </Link>
                <p className="text-sm text-gray-500">{book.author}</p>
                {book.breadcrumb && (
                  <p className="text-xs text-blue-500 mt-0.5">{book.breadcrumb}</p>
                )}
              </div>

              {/* Remove button */}
              <button
                onClick={() => handleRemove(book.id)}
                className="shrink-0 px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
