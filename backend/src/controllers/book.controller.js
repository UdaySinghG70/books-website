const fs = require('fs');
const path = require('path');
const db = require('../db');
const { getBreadcrumb } = require('./category.controller');

const PAGE_SIZE = 20;

const getBooks = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || PAGE_SIZE;
    const offset = (page - 1) * limit;

    const [books] = await db.execute(
      `SELECT b.*, c.name AS category_name, c.level AS category_level, c.parent_id AS category_parent_id
       FROM books b
       LEFT JOIN categories c ON b.category_id = c.id
       ORDER BY b.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [[{ total }]] = await db.execute('SELECT COUNT(*) AS total FROM books');

    // Build breadcrumb for each book
    const booksWithCrumbs = await Promise.all(
      books.map(async (book) => {
        const breadcrumb = book.category_id
          ? await getBreadcrumb(book.category_id)
          : null;
        return { ...book, breadcrumb };
      })
    );

    res.json({
      books: booksWithCrumbs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getBook = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(
      `SELECT b.*, c.name AS category_name, c.level AS category_level, c.parent_id AS category_parent_id
       FROM books b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.id = ?`,
      [parseInt(id)]
    );

    if (rows.length === 0) return res.status(404).json({ message: 'Book not found' });

    const book = rows[0];
    const breadcrumb = book.category_id ? await getBreadcrumb(book.category_id) : null;

    // Check if authenticated user has favorited this book
    let isFavorited = false;
    if (req.user) {
      const [favRows] = await db.execute(
        'SELECT id FROM favorites WHERE user_id = ? AND book_id = ?',
        [req.user.id, book.id]
      );
      isFavorited = favRows.length > 0;
    }

    res.json({ ...book, breadcrumb, isFavorited });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const createBook = async (req, res) => {
  try {
    const { title, author, description, categoryId } = req.body;
    if (!title || !author) {
      return res.status(400).json({ message: 'Title and author are required' });
    }

    const coverImage = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await db.execute(
      'INSERT INTO books (title, author, description, cover_image, category_id) VALUES (?, ?, ?, ?, ?)',
      [title, author, description || null, coverImage, categoryId ? parseInt(categoryId) : null]
    );

    const [rows] = await db.execute(
      `SELECT b.*, c.name AS category_name
       FROM books b LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.id = ?`,
      [result.insertId]
    );

    const book = rows[0];
    const breadcrumb = book.category_id ? await getBreadcrumb(book.category_id) : null;
    res.status(201).json({ ...book, breadcrumb });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, description, categoryId } = req.body;

    // Fetch existing book
    const [existing] = await db.execute('SELECT * FROM books WHERE id = ?', [parseInt(id)]);
    if (existing.length === 0) return res.status(404).json({ message: 'Book not found' });
    const book = existing[0];

    // Handle cover image replacement
    let coverImage = book.cover_image;
    if (req.file) {
      if (book.cover_image) {
        const oldPath = path.join(__dirname, '../../', book.cover_image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      coverImage = `/uploads/${req.file.filename}`;
    }

    await db.execute(
      `UPDATE books SET
         title       = ?,
         author      = ?,
         description = ?,
         cover_image = ?,
         category_id = ?,
         updated_at  = NOW()
       WHERE id = ?`,
      [
        title       || book.title,
        author      || book.author,
        description !== undefined ? description : book.description,
        coverImage,
        categoryId  ? parseInt(categoryId) : book.category_id,
        parseInt(id),
      ]
    );

    const [rows] = await db.execute(
      `SELECT b.*, c.name AS category_name
       FROM books b LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.id = ?`,
      [parseInt(id)]
    );

    const updated = rows[0];
    const breadcrumb = updated.category_id ? await getBreadcrumb(updated.category_id) : null;
    res.json({ ...updated, breadcrumb });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.execute('SELECT * FROM books WHERE id = ?', [parseInt(id)]);
    if (existing.length === 0) return res.status(404).json({ message: 'Book not found' });

    const book = existing[0];
    if (book.cover_image) {
      const filePath = path.join(__dirname, '../../', book.cover_image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await db.execute('DELETE FROM books WHERE id = ?', [parseInt(id)]);
    res.json({ message: 'Book deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getBooks, getBook, createBook, updateBook, deleteBook };
