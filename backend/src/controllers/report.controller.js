const db = require('../db');

const getFavoritesLastMonth = async (req, res) => {
  try {
    const [[{ count }]] = await db.execute(
      'SELECT COUNT(*) AS count FROM favorites WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)'
    );
    res.json({ count, period: 'last_month' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getFavoritesTimeline = async (req, res) => {
  try {
    // Get daily counts for the last 30 days using MySQL date functions
    const [rows] = await db.execute(
      `SELECT
         DATE(created_at)    AS date,
         COUNT(*)            AS count
       FROM favorites
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );

    // Fill in missing days with 0
    const dataMap = {};
    rows.forEach((r) => {
      dataMap[r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date] = Number(r.count);
    });

    const timeline = [];
    for (let i = 30; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      timeline.push({ date: key, count: dataMap[key] || 0 });
    }

    res.json(timeline);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getStats = async (req, res) => {
  try {
    const [[{ totalBooks }]]          = await db.execute('SELECT COUNT(*) AS totalBooks FROM books');
    const [[{ totalUsers }]]          = await db.execute("SELECT COUNT(*) AS totalUsers FROM users WHERE role = 'USER'");
    const [[{ totalFavorites }]]      = await db.execute('SELECT COUNT(*) AS totalFavorites FROM favorites');
    const [[{ favoritesLastMonth }]]  = await db.execute(
      'SELECT COUNT(*) AS favoritesLastMonth FROM favorites WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)'
    );

    res.json({
      totalBooks:         Number(totalBooks),
      totalUsers:         Number(totalUsers),
      totalFavorites:     Number(totalFavorites),
      favoritesLastMonth: Number(favoritesLastMonth),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getFavoritesLastMonth, getFavoritesTimeline, getStats };
