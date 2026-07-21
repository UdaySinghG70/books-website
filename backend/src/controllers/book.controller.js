const fs   = require('fs');
const path = require('path');
const db   = require('../db');
const { getBreadcrumb } = require('./category.controller');

const PAGE_SIZE = 20;

// Save uploaded file buffer to /uploads (local dev only)
// On Vercel the filesystem is read-only so we skip saving and return null
const saveUploadedFile = (file) => {
  if (!file) return null;

  // On Vercel, __dirname points inside the function bundle — skip disk write
  const isVercel = !!process.env.VERCEL;
  if (isVercel) {
    // In production without Cloudinary, uploaded covers are not persisted
    // Return null so the existing cover_image is kept on updates
    return null;
  }

  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const ext      = path.extname(file.originalname).toLowerCase();
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const fullPath = path.join(uploadDir, filename);
  fs.writeFileSync(fullPath, file.buffer);
  return `/uploads/${filename}`;
};

const getBooks = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || PAGE_SIZE;
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

    const booksWithCrumbs = await Promise.all(
      books.map(async (book) => {
        const breadcrumb = book.category_id ? await getBreadcrumb(book.category_id) : null;
        return { ...book, breadcrumb };
      })
    );

    res.json({
      books: booksWithCrumbs,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
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

    const book      = rows[0];
    const breadcrumb = book.category_id ? await getBreadcrumb(book.category_id) : null;

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
    if (!title || !author) return res.status(400).json({ message: 'Title and author are required' });

    const coverImage = saveUploadedFile(req.file);

    const [result] = await db.execute(
      'INSERT INTO books (title, author, description, cover_image, category_id) VALUES (?, ?, ?, ?, ?)',
      [title, author, description || null, coverImage, categoryId ? parseInt(categoryId) : null]
    );

    const [rows] = await db.execute(
      `SELECT b.*, c.name AS category_name FROM books b
       LEFT JOIN categories c ON b.category_id = c.id WHERE b.id = ?`,
      [result.insertId]
    );
    const book       = rows[0];
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

    const [existing] = await db.execute('SELECT * FROM books WHERE id = ?', [parseInt(id)]);
    if (existing.length === 0) return res.status(404).json({ message: 'Book not found' });
    const book = existing[0];

    // Only replace cover if a new file was uploaded AND we could save it
    const newCover   = saveUploadedFile(req.file);
    const coverImage = newCover || book.cover_image;

    await db.execute(
      `UPDATE books SET title=?, author=?, description=?, cover_image=?, category_id=?, updated_at=NOW()
       WHERE id=?`,
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
      `SELECT b.*, c.name AS category_name FROM books b
       LEFT JOIN categories c ON b.category_id = c.id WHERE b.id = ?`,
      [parseInt(id)]
    );
    const updated    = rows[0];
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

    // Delete local file if it exists (no-op on Vercel)
    const book = existing[0];
    if (book.cover_image && book.cover_image.startsWith('/uploads/')) {
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
