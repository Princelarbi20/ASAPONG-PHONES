import React, { useState } from 'react';
import axiosInstance from '../../lib/axios';

export default function UpdateOrder({ orderId, currentStatus, onStatusUpdated }) {
  const [isUpdating, setIsUpdating] = useState(false);

  // UPDATE ORDER STATUS
  const handleDropdownChange = async (e) => {
    const nextStatus = e.target.value;
    try {
      setIsUpdating(true);

      await axiosInstance.put(
        `/update-orders/${orderId}`,
        { status: nextStatus }
      );

      // 3. Update parent layout state on success
      onStatusUpdated(orderId, nextStatus);
    } catch (err) {
      console.error('Error changing order status via Axios:', err);
      alert(err.response?.data?.message || 'Failed to modify order status. Access Denied.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <select
      value={currentStatus}
      onChange={handleDropdownChange}
      disabled={isUpdating}
      className="text-xs bg-gray-50 border border-gray-300 text-gray-700 rounded-lg p-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
    >
      <option value="Pending">Pending</option>
      <option value="Shipped">Shipped</option>
      <option value="Cancelled">Cancelled</option>
    </select>
  );
}