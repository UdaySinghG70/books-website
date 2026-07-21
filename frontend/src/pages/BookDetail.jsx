import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function BookDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await api.get(`/books/${id}`);
        setBook(res.data);
        setIsFavorited(res.data.isFavorited || false);
      } catch (err) {
        if (err.response?.status === 404) navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id, navigate]);

  const toggleFavorite = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/books/${id}` } });
      return;
    }
    setFavLoading(true);
    try {
      if (isFavorited) {
        await api.delete(`/favorites/${book.id}`);
        setIsFavorited(false);
      } else {
        await api.post('/favorites', { bookId: book.id });
        setIsFavorited(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFavLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-10">
        {/* Cover */}
        <div className="shrink-0">
          <div className="w-52 h-72 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg shadow-md overflow-hidden">
            {book.cover_image ? (
              <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                <div className="text-6xl mb-3">📚</div>
                <span className="text-sm text-indigo-600 font-medium">{book.title}</span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{book.title}</h1>
          <p className="text-lg text-gray-600 mb-3">{book.author}</p>

          {book.breadcrumb && (
            <p className="text-sm text-blue-600 mb-4">{book.breadcrumb}</p>
          )}

          {book.description && (
            <p className="text-gray-700 leading-relaxed text-sm mb-6 max-w-prose">
              {book.description}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={toggleFavorite}
              disabled={favLoading}
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              className={`text-2xl transition-transform hover:scale-110 ${favLoading ? 'opacity-50' : ''}`}
            >
              {isFavorited ? '❤️' : '🤍'}
            </button>

            <button
              onClick={toggleFavorite}
              disabled={favLoading}
              className={`px-5 py-2 rounded-md text-sm font-semibold transition-colors ${
                isFavorited
                  ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {favLoading
                ? 'Updating...'
                : isFavorited
                ? 'Remove from Favorites'
                : 'Add to Favorites'}
            </button>
          </div>

          {!user && (
            <p className="text-xs text-gray-400 mt-2">
              <a href="/login" className="text-blue-500 hover:underline">Log in</a> to save favorites
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
