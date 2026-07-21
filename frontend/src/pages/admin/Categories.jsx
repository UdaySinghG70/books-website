import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../api/axios';

// Recursive tree node component
function CategoryNode({ category, onDeleted }) {
  const [open, setOpen] = useState(true);
  const hasChildren = category.children && category.children.length > 0;

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${category.name}"? This may affect child categories and books.`)) return;
    try {
      await api.delete(`/categories/${category.id}`);
      onDeleted();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const levelColors = {
    1: 'text-gray-800 font-bold',
    2: 'text-gray-700 font-semibold',
    3: 'text-gray-600',
  };

  return (
    <div className="ml-4">
      <div className="flex items-center gap-2 py-1 group">
        {/* Toggle icon */}
        <button
          onClick={() => setOpen(!open)}
          className="w-4 text-gray-400 text-xs shrink-0"
        >
          {hasChildren ? (open ? '▼' : '▶') : ' '}
        </button>

        {/* Folder icon */}
        <span className="text-base shrink-0">
          {category.level === 3 ? '📄' : open ? '📂' : '📁'}
        </span>

        {/* Name */}
        <span className={`text-sm ${levelColors[category.level] || 'text-gray-600'}`}>
          {category.name}
        </span>

        {/* Level badge */}
        <span className="ml-1 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
          L{category.level}
        </span>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          className="ml-auto text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity px-2"
        >
          ✕
        </button>
      </div>

      {/* Children */}
      {hasChildren && open && (
        <div className="border-l border-gray-200 ml-2">
          {category.children.map((child) => (
            <CategoryNode key={child.id} category={child} onDeleted={onDeleted} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Categories() {
  const [tree, setTree] = useState([]);
  const [flat, setFlat] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ name: '', parentId: '', level: '1' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setTree(res.data.tree);
      setFlat(res.data.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Auto-set level based on parent
  const handleParentChange = (e) => {
    const parentId = e.target.value;
    if (!parentId) {
      setForm({ ...form, parentId: '', level: '1' });
    } else {
      const parent = flat.find((c) => c.id === parseInt(parentId));
      const newLevel = parent ? String(parent.level + 1) : '2';
      setForm({ ...form, parentId, level: newLevel });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post('/categories', {
        name: form.name,
        parentId: form.parentId || null,
        level: parseInt(form.level),
      });
      setForm({ name: '', parentId: '', level: '1' });
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  // Filter parents based on chosen level (level 2 needs L1 parents, level 3 needs L2)
  const eligibleParents = flat.filter((c) => c.level === parseInt(form.level) - 1);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Category Management</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tree panel */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex-1">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Categories</h2>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : tree.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No categories yet. Add one!</p>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">📚</span>
                <span className="text-sm font-bold text-gray-700">All Books</span>
              </div>
              {tree.map((cat) => (
                <CategoryNode key={cat.id} category={cat} onDeleted={fetchCategories} />
              ))}
            </div>
          )}
        </div>

        {/* Add form */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 w-full lg:w-72 shrink-0">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Add Category</h2>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-md mb-3">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value, parentId: '' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">1 (Root)</option>
                <option value="2">2 (Sub)</option>
                <option value="3">3 (Leaf)</option>
              </select>
            </div>

            {form.level !== '1' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                <select
                  value={form.parentId}
                  onChange={handleParentChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select parent...</option>
                  {eligibleParents.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Classic"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
