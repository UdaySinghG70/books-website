const db = require('../db');
const { getBreadcrumb } = require('./category.controller');

const getFavorites = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT b.*, c.name AS category_name, f.created_at AS favorited_at
       FROM favorites f
       JOIN books b      ON f.book_id = b.id
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );

    const result = await Promise.all(
      rows.map(async (book) => {
        const breadcrumb = book.category_id
          ? await getBreadcrumb(book.category_id)
          : null;
        return { ...book, breadcrumb };
      })
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const addFavorite = async (req, res) => {
  try {
    const { bookId } = req.body;
    if (!bookId) return res.status(400).json({ message: 'bookId is required' });

    const [bookRows] = await db.execute('SELECT id FROM books WHERE id = ?', [parseInt(bookId)]);
    if (bookRows.length === 0) return res.status(404).json({ message: 'Book not found' });

    // INSERT IGNORE silently skips if the unique key already exists
    await db.execute(
      'INSERT IGNORE INTO favorites (user_id, book_id) VALUES (?, ?)',
      [req.user.id, parseInt(bookId)]
    );

    res.status(201).json({ message: 'Added to favorites' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const { bookId } = req.params;
    await db.execute(
      'DELETE FROM favorites WHERE user_id = ? AND book_id = ?',
      [req.user.id, parseInt(bookId)]
    );
    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getFavorites, addFavorite, removeFavorite };
