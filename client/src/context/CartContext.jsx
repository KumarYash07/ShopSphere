import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  getCartApi,
  addToCartApi,
  updateCartItemApi,
  removeFromCartApi,
  clearCartApi,
} from '../api/cartApi';

const CartContext = createContext(null);

/**
 * Format backend cart items array into a clean, normalized structure for frontend UI components.
 */
const formatCartItems = (backendItems = []) => {
  return backendItems.map((item) => {
    const prod = item.product || {};
    const prodId = prod._id || item.product;
    const price = item.price ?? prod.finalPrice ?? prod.price ?? 0;
    const origPrice = prod.price ?? price;

    return {
      _id: prodId,
      id: prodId,
      name: prod.name || 'Product',
      images: Array.isArray(prod.images) && prod.images.length > 0
        ? prod.images
        : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'],
      brand: prod.brand || 'ShopSphere',
      price: price,
      originalPrice: origPrice,
      finalPrice: price,
      qty: item.quantity || 1,
      quantity: item.quantity || 1,
      stock: prod.stock ?? 99,
      status: prod.status || 'active',
      rawProduct: prod,
    };
  });
};

export function CartProvider({ children }) {
  const { isAuthenticated, openLogin } = useAuth();
  const [cart, setCart] = useState([]);
  const [loadingCart, setLoadingCart] = useState(false);

  // Sync cart from backend DB whenever auth state changes
  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart([]);
      return;
    }
    setLoadingCart(true);
    try {
      const data = await getCartApi();
      if (data.success && data.cart && Array.isArray(data.cart.items)) {
        setCart(formatCartItems(data.cart.items));
      }
    } catch (err) {
      console.error('Failed to fetch user cart from backend:', err);
    } finally {
      setLoadingCart(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (product, qty = 1) => {
    if (!isAuthenticated) {
      openLogin();
      return { success: false, requireAuth: true };
    }

    const prodId = product._id || product.id;
    try {
      const data = await addToCartApi(prodId, qty);
      if (data.success && data.cart && Array.isArray(data.cart.items)) {
        setCart(formatCartItems(data.cart.items));
        return { success: true, message: data.message };
      }
    } catch (err) {
      console.error('Add to cart backend error:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to add product to cart.',
      };
    }
  };

  const updateQty = async (productId, qty) => {
    if (!isAuthenticated) return;
    if (qty <= 0) {
      return removeFromCart(productId);
    }
    try {
      const data = await updateCartItemApi(productId, qty);
      if (data.success && data.cart && Array.isArray(data.cart.items)) {
        setCart(formatCartItems(data.cart.items));
      }
    } catch (err) {
      console.error('Update cart quantity error:', err);
    }
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) return;
    try {
      const data = await removeFromCartApi(productId);
      if (data.success && data.cart && Array.isArray(data.cart.items)) {
        setCart(formatCartItems(data.cart.items));
      }
    } catch (err) {
      console.error('Remove cart item error:', err);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await clearCartApi();
      if (data.success) {
        setCart([]);
      }
    } catch (err) {
      console.error('Clear cart error:', err);
    }
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + (Number(item.finalPrice ?? item.price) || 0) * item.qty,
    0
  );

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        loadingCart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        fetchCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
