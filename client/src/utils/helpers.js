// Utility helpers for ShopSphere

export const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

export const formatNumber = (num) =>
  new Intl.NumberFormat('en-IN').format(num);

export const formatCompact = (num) => {
  if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num;
};

export const truncate = (str, n = 60) => str.length > n ? str.slice(0, n) + '…' : str;

export const getStatusColor = (status) => {
  const map = {
    pending: 'warning',
    confirmed: 'info',
    packed: 'primary',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'danger',
    active: 'success',
    inactive: 'danger',
  };
  return map[status] || 'secondary';
};

export const getStatusLabel = (status) => {
  const map = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    packed: 'Packed',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return map[status] || status;
};

export const generateStars = (rating) => {
  return Array.from({ length: 5 }, (_, i) => ({
    filled: i < Math.floor(rating),
    half: i === Math.floor(rating) && rating % 1 >= 0.5,
  }));
};

export const sleep = (ms) => new Promise(r => setTimeout(r, ms));
