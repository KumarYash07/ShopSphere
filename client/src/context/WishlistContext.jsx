import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getWishlistApi,
  addToWishlistApi,
  removeFromWishlistApi
} from '../api/wishlistApi';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated, openLogin } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper to extract product ID
  const getProductId = useCallback((product) => {
    if (!product) return null;
    if (typeof product === 'string') return product;
    return product._id || product.id;
  }, []);

  // Fetch wishlist from backend
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }

    try {
      setLoading(true);
      const data = await getWishlistApi();
      if (data.success && Array.isArray(data.wishlist)) {
        setWishlist(data.wishlist);
      } else {
        setWishlist([]);
      }
    } catch (error) {
      console.error('Fetch Wishlist Error:', error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Sync wishlist whenever user logs in or logs out
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Check if a product is wishlisted
  const isWishlisted = useCallback((productId) => {
    if (!productId) return false;
    const targetId = typeof productId === 'string' ? productId : getProductId(productId);
    return wishlist.some((item) => getProductId(item) === targetId);
  }, [wishlist, getProductId]);

  // Toggle wishlist item (Add if absent, Remove if present)
  const toggleWishlist = async (product) => {
    if (!isAuthenticated) {
      openLogin();
      return { success: false, requireAuth: true };
    }

    const productId = getProductId(product);
    if (!productId) {
      console.error('Product ID missing for wishlist toggle');
      return { success: false, message: 'Product ID is missing.' };
    }

    const alreadyWishlisted = wishlist.some((item) => getProductId(item) === productId);

    if (alreadyWishlisted) {
      // Optimistic remove
      setWishlist((prev) => prev.filter((item) => getProductId(item) !== productId));

      try {
        const data = await removeFromWishlistApi(productId);
        return { success: true, wishlisted: false, message: data.message };
      } catch (error) {
        console.error('Remove Wishlist Error:', error);
        // Rollback
        fetchWishlist();
        return { success: false, message: error.response?.data?.message || error.message };
      }
    } else {
      // Optimistic add
      const optimisticItem = typeof product === 'object' ? product : { _id: productId };
      setWishlist((prev) => [...prev, optimisticItem]);

      try {
        const data = await addToWishlistApi(productId);
        if (data.success && data.wishlistItem) {
          // Replace optimistic item with server response
          setWishlist((prev) => {
            const filtered = prev.filter((item) => getProductId(item) !== productId);
            return [...filtered, data.wishlistItem];
          });
        }
        return { success: true, wishlisted: true, message: data.message };
      } catch (error) {
        console.error('Add Wishlist Error:', error);
        // Rollback
        fetchWishlist();
        return { success: false, message: error.response?.data?.message || error.message };
      }
    }
  };

  // Direct remove from wishlist
  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) {
      openLogin();
      return { success: false, requireAuth: true };
    }

    const targetId = typeof productId === 'string' ? productId : getProductId(productId);
    if (!targetId) return { success: false };

    // Optimistic remove
    setWishlist((prev) => prev.filter((item) => getProductId(item) !== targetId));

    try {
      const data = await removeFromWishlistApi(targetId);
      return { success: true, message: data.message };
    } catch (error) {
      console.error('Remove Wishlist Error:', error);
      fetchWishlist();
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  const value = {
    wishlist,
    toggleWishlist,
    isWishlisted,
    removeFromWishlist,
    wishlistCount: wishlist.length,
    loading,
    fetchWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return ctx;
};