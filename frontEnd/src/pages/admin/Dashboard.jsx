import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, ShoppingBag, Users, AlertCircle, Package, UserX, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
    activeOrders: 0,
    suspendedUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const token = localStorage.getItem('token');

      // Make a call to a centralized stats dashboard route
      const response = await axios.get('http://localhost:5000/api/v1/dashboard-stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.stats) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to update system metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Map the fetched state values dynamically into layout metrics cards
  const analytics = [
    { title: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'bg-emerald-500' },
    { title: 'Active Orders', value: stats.activeOrders.toString(), icon: ShoppingBag, color: 'bg-amber-500' },
    { title: 'Registered Users', value: stats.totalUsers.toString(), icon: Users, color: 'bg-indigo-500' },
    { title: 'Suspended Users', value: stats.suspendedUsers.toString(), icon: UserX, color: 'bg-rose-500' },
    { title: 'Total Products', value: stats.totalProducts.toString(), icon: Package, color: 'bg-blue-500' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">System Overview</h2>

      {errorMsg && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-200 text-sm font-medium text-red-800">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {analytics.map((card) => (
          <div key={card.title} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
            </div>
            <div className={`${card.color} p-3.5 rounded-xl text-white`}>
              <card.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}