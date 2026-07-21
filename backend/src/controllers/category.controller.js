const db = require('../db');

// Build a nested tree from a flat list
const buildTree = (categories, parentId = null) => {
  return categories
    .filter((c) => c.parent_id === parentId)
    .map((c) => ({ ...c, children: buildTree(categories, c.id) }));
};

// Get full breadcrumb string for a category id e.g. "Fiction > Romance > Classic"
const getBreadcrumb = async (categoryId) => {
  const crumbs = [];
  let currentId = categoryId;

  while (currentId) {
    const [rows] = await db.execute(
      'SELECT id, name, parent_id FROM categories WHERE id = ?',
      [currentId]
    );
    if (rows.length === 0) break;
    crumbs.unshift(rows[0].name);
    currentId = rows[0].parent_id;
  }

  return crumbs.join(' > ');
};

const getAll = async (req, res) => {
  try {
    const [categories] = await db.execute(
      'SELECT * FROM categories ORDER BY level ASC, name ASC'
    );
    const tree = buildTree(categories);
    res.json({ categories, tree });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getLeafCategories = async (req, res) => {
  try {
    const [all] = await db.execute('SELECT * FROM categories');
    const parentIds = new Set(
      all.filter((c) => c.parent_id !== null).map((c) => c.parent_id)
    );
    // A category is a leaf if nothing references it as parent
    const leaves = all.filter((c) => !parentIds.has(c.id));
    res.json(leaves);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const create = async (req, res) => {
  try {
    const { name, parentId, level } = req.body;
    if (!name || !level) {
      return res.status(400).json({ message: 'Name and level are required' });
    }
    const lvl = parseInt(level);
    if (lvl < 1 || lvl > 3) {
      return res.status(400).json({ message: 'Level must be 1, 2, or 3' });
    }
    if (lvl > 1 && !parentId) {
      return res.status(400).json({ message: 'Parent category required for level 2 and 3' });
    }

    const [result] = await db.execute(
      'INSERT INTO categories (name, level, parent_id) VALUES (?, ?, ?)',
      [name, lvl, parentId ? parseInt(parentId) : null]
    );

    const [rows] = await db.execute('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parentId, level } = req.body;

    await db.execute(
      'UPDATE categories SET name = ?, level = ?, parent_id = ? WHERE id = ?',
      [
        name,
        level ? parseInt(level) : null,
        parentId ? parseInt(parentId) : null,
        parseInt(id),
      ]
    );

    const [rows] = await db.execute('SELECT * FROM categories WHERE id = ?', [parseInt(id)]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM categories WHERE id = ?', [parseInt(id)]);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAll, getLeafCategories, create, update, remove, getBreadcrumb };
