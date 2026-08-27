import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated, openLogin } = useAuth();
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ss_wishlist')) || []; } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('ss_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const getProductId = (product) => product._id || product.id;

  const toggleWishlist = (product) => {
    if (!isAuthenticated) {
      openLogin();
      return { success: false, requireAuth: true };
    }

    const pId = getProductId(product);
    setWishlist((prev) => {
      const exists = prev.some((item) => getProductId(item) === pId);
      if (exists) {
        return prev.filter((item) => getProductId(item) !== pId);
      }
      return [...prev, product];
    });
    return { success: true };
  };

  const isWishlisted = (productId) =>
    wishlist.some((item) => getProductId(item) === productId);

  const removeFromWishlist = (productId) =>
    setWishlist((prev) => prev.filter((item) => getProductId(item) !== productId));

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isWishlisted,
        removeFromWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
