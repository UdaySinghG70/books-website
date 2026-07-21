import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../api/axios';

function StatCard({ label, value, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-green-50 text-green-700 border-green-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-100',
  };
  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <p className="text-sm font-medium opacity-70">{label}</p>
      <p className="text-3xl font-bold mt-1">{value ?? '—'}</p>
    </div>
  );
}

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, timelineRes] = await Promise.all([
          api.get('/reports/stats'),
          api.get('/reports/favorites-timeline'),
        ]);
        setStats(statsRes.data);
        // Format dates for chart
        setTimeline(
          timelineRes.data.map((d) => ({
            ...d,
            label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reports</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Books" value={stats?.totalBooks} color="blue" />
            <StatCard label="Total Users" value={stats?.totalUsers} color="green" />
            <StatCard label="Total Favorites" value={stats?.totalFavorites} color="purple" />
            <StatCard label="Favorites (Last Month)" value={stats?.favoritesLastMonth} color="orange" />
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-gray-700">
                  Books Marked as Favorite in Last Month
                </h2>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats?.favoritesLastMonth ?? 0}
                </p>
              </div>
              {/* Bar chart icon */}
              <div className="text-2xl text-gray-300">📊</div>
            </div>

            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={timeline} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
