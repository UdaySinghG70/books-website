import { Link } from 'react-router-dom';

// Resolve cover image — handles both external URLs and local /uploads/ paths
const resolveCover = (coverImage) => {
  if (!coverImage) return null;
  if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
    return coverImage; // external URL (Open Library, etc.)
  }
  return coverImage; // local path served by Express e.g. /uploads/filename.jpg
};

export default function BookCard({ book }) {
  const cover = resolveCover(book.cover_image || book.coverImage);

  return (
    <Link to={`/books/${book.id}`} className="group block">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden h-full">
        {/* Cover image */}
        <div className="h-56 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden flex items-center justify-center">
          {cover ? (
            <img
              src={cover}
              alt={book.title}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // Fallback to placeholder on broken image
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          {/* Fallback shown when no cover or image fails to load */}
          <div
            style={{ display: cover ? 'none' : 'flex' }}
            className="flex-col items-center justify-center h-full w-full p-4 text-center"
          >
            <div className="text-5xl mb-2">📚</div>
            <span className="text-xs text-indigo-500 font-medium line-clamp-2 leading-snug">
              {book.title}
            </span>
          </div>
        </div>

        {/* Book info */}
        <div className="p-3">
          <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1">{book.author}</p>
          {book.breadcrumb && (
            <p className="text-xs text-blue-500 mt-1 line-clamp-1">{book.breadcrumb}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
