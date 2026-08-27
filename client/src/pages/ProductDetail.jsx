import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHeart, FiShoppingCart, FiZap, FiStar, FiPackage, FiShield,
  FiTruck, FiRotateCcw, FiChevronRight, FiShare2, FiMinus, FiPlus, FiCheck
} from 'react-icons/fi';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import ProductCard from '../components/product/ProductCard';
import { getProductByIdApi, getProductsApi } from '../api/productApi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../utils/helpers';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, openLogin } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProductByIdApi(id);
        if (data.success && data.product) {
          setProduct(data.product);

          // Fetch related products in same category
          if (data.product.category?._id) {
            const relData = await getProductsApi({ category: data.product.category._id });
            if (relData.success && relData.products) {
              setRelatedProducts(relData.products.filter(p => (p._id || p.id) !== id).slice(0, 4));
            }
          }
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        console.error('Failed to load product detail:', err);
        setError('Unable to load product details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container py-5 min-vh-100">
          <div className="row g-5">
            <div className="col-md-6">
              <div className="bg-secondary-subtle rounded-4 aspect-ratio-1 animate-pulse" style={{ height: 400 }} />
            </div>
            <div className="col-md-6">
              <div className="bg-secondary-subtle rounded w-50 h-4 mb-3 animate-pulse" />
              <div className="bg-secondary-subtle rounded w-75 h-6 mb-4 animate-pulse" />
              <div className="bg-secondary-subtle rounded w-25 h-8 mb-4 animate-pulse" />
              <div className="bg-secondary-subtle rounded w-100 h-20 mb-4 animate-pulse" />
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="container py-5 my-5 text-center min-vh-100">
          <div className="display-4 text-muted mb-3">📦</div>
          <h3 className="fw-bold text-dark">Product Not Found</h3>
          <p className="text-muted">{error || "This product doesn't exist or is currently inactive."}</p>
          <Link to="/products" className="btn btn-primary rounded-pill px-4 fw-bold">
            Browse All Products
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const productId = product._id || product.id;
  const wishlisted = isWishlisted(productId);

  const originalPrice = Number(product.price) || 0;
  const discount = Number(product.discount) || 0;
  const finalPrice = product.finalPrice !== undefined
    ? Number(product.finalPrice)
    : Number((originalPrice - (originalPrice * discount) / 100).toFixed(2));

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'];

  const rating = Number(product.rating) || 4.5;
  const reviewsCount = Number(product.totalReviews ?? 12);
  const isOutOfStock = product.stock === 0 || product.status === 'out_of_stock';
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.floor(rating));

  const handleCart = () => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    const res = addToCart(product, qty);
    if (res.success) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    addToCart(product, qty);
    navigate('/checkout');
  };

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    toggleWishlist(product);
  };

  return (
    <>
      <Navbar />
      <div className="bg-light py-4 min-vh-100">
        <div className="container">
          
          {/* Breadcrumb */}
          <nav className="d-flex align-items-center gap-2 mb-4 small text-muted">
            <Link to="/" className="text-decoration-none text-muted">Home</Link>
            <FiChevronRight size={12} />
            <Link to="/products" className="text-decoration-none text-muted">Products</Link>
            <FiChevronRight size={12} />
            {product.category?.name && (
              <>
                <Link to={`/products?category=${product.category._id}`} className="text-decoration-none text-muted">
                  {product.category.name}
                </Link>
                <FiChevronRight size={12} />
              </>
            )}
            <span className="text-dark fw-semibold text-truncate" style={{ maxWidth: 200 }}>
              {product.name}
            </span>
          </nav>

          <div className="row g-4 bg-white rounded-4 shadow-sm p-3 p-md-4 mb-5">
            {/* Left: Product Images */}
            <div className="col-12 col-md-6 col-lg-5">
              <div className="position-relative rounded-4 overflow-hidden bg-light mb-3" style={{ aspectRatio: '1/1' }}>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImg}
                    src={images[selectedImg]}
                    alt={product.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-100 h-100 object-fit-cover"
                  />
                </AnimatePresence>

                {discount > 0 && (
                  <span className="badge bg-danger position-absolute top-0 start-0 m-3 px-3 py-2 fw-bold fs-6">
                    {discount}% OFF
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  className="btn btn-sm rounded-circle position-absolute top-0 end-0 m-3 shadow-sm d-flex align-items-center justify-content-center"
                  style={{ width: 38, height: 38, background: wishlisted ? '#fef2f2' : 'white' }}
                >
                  <FiHeart size={18} style={{ fill: wishlisted ? '#ef4444' : 'none', color: wishlisted ? '#ef4444' : '#64748b' }} />
                </button>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="d-flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImg(i)}
                      className={`btn p-0 rounded-3 border-2 overflow-hidden flex-shrink-0 ${selectedImg === i ? 'border-primary' : 'border-light'}`}
                      style={{ width: 70, height: 70 }}
                    >
                      <img src={img} alt="" className="w-100 h-100 object-fit-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info & Pricing */}
            <div className="col-12 col-md-6 col-lg-7 d-flex flex-column justify-content-between">
              <div>
                {/* Brand */}
                {product.brand && (
                  <div className="text-uppercase fw-bold text-primary mb-1 small" style={{ letterSpacing: '0.05em' }}>
                    {product.brand}
                  </div>
                )}

                {/* Name */}
                <h2 className="fw-bold text-dark mb-3">{product.name}</h2>

                {/* Rating & Store */}
                <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
                  <div className="d-flex align-items-center gap-1 bg-amber-subtle px-2 py-1 rounded-2" style={{ background: '#fef3c7' }}>
                    <FiStar className="text-warning fill-warning" size={14} />
                    <span className="fw-bold text-warning-dark small">{rating}</span>
                  </div>
                  <span className="small text-muted">({reviewsCount} Reviews)</span>
                  {product.store && (
                    <>
                      <span className="text-muted">|</span>
                      <span className="small text-muted">
                        Sold by: <strong className="text-dark">{product.store.storeName}</strong>
                      </span>
                    </>
                  )}
                </div>

                {/* Price Display */}
                <div className="p-3 bg-light rounded-3 mb-4">
                  <div className="d-flex align-items-baseline gap-3">
                    <span className="display-6 fw-bold text-dark">{formatPrice(finalPrice)}</span>
                    {discount > 0 && originalPrice > finalPrice && (
                      <>
                        <span className="text-muted text-decoration-line-through fs-5">{formatPrice(originalPrice)}</span>
                        <span className="badge bg-danger-subtle text-danger px-2 py-1 fw-bold" style={{ background: '#fef2f2' }}>
                          Save {formatPrice(originalPrice - finalPrice)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Description snippet */}
                <p className="text-secondary small leading-relaxed mb-4">
                  {product.description}
                </p>

                {/* Stock Selector */}
                <div className="d-flex align-items-center gap-3 mb-4">
                  <span className="fw-semibold small">Quantity:</span>
                  <div className="d-flex align-items-center border rounded-3 overflow-hidden">
                    <button
                      className="btn btn-sm btn-light rounded-0 px-3 py-2 border-end"
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      disabled={isOutOfStock}
                    >
                      <FiMinus />
                    </button>
                    <span className="px-3 fw-bold">{qty}</span>
                    <button
                      className="btn btn-sm btn-light rounded-0 px-3 py-2 border-start"
                      onClick={() => setQty(q => Math.min(product.stock || 10, q + 1))}
                      disabled={isOutOfStock}
                    >
                      <FiPlus />
                    </button>
                  </div>

                  <span className={`small fw-semibold ${isOutOfStock ? 'text-danger' : 'text-success'}`}>
                    {isOutOfStock ? 'Out of Stock' : `${product.stock} items available`}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div>
                <div className="row g-2 mb-4">
                  <div className="col-12 col-sm-6">
                    <button
                      onClick={handleCart}
                      disabled={isOutOfStock}
                      className={`btn w-100 py-3 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 ${
                        addedToCart ? 'btn-success' : 'btn-outline-primary'
                      }`}
                    >
                      {addedToCart ? <><FiCheck /> Added to Cart!</> : <><FiShoppingCart /> Add to Cart</>}
                    </button>
                  </div>
                  <div className="col-12 col-sm-6">
                    <button
                      onClick={handleBuyNow}
                      disabled={isOutOfStock}
                      className="btn btn-primary w-100 py-3 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                      style={{ background: '#4F46E5', borderColor: '#4F46E5' }}
                    >
                      <FiZap /> Buy Now
                    </button>
                  </div>
                </div>

                {/* Trust Features */}
                <div className="row g-2 pt-3 border-top text-center text-muted small">
                  <div className="col-4">
                    <FiTruck className="text-primary mb-1" size={20} />
                    <div className="fw-semibold text-dark">Fast Delivery</div>
                  </div>
                  <div className="col-4">
                    <FiRotateCcw className="text-primary mb-1" size={20} />
                    <div className="fw-semibold text-dark">7 Day Returns</div>
                  </div>
                  <div className="col-4">
                    <FiShield className="text-primary mb-1" size={20} />
                    <div className="fw-semibold text-dark">Buyer Protection</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Specifications & Seller Details Tabs */}
          <div className="bg-white rounded-4 shadow-sm p-4 mb-5">
            <ul className="nav nav-tabs border-bottom mb-4">
              <li className="nav-item">
                <button
                  className={`nav-link fw-bold ${activeTab === 'description' ? 'active text-primary' : 'text-muted'}`}
                  onClick={() => setActiveTab('description')}
                >
                  Description
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link fw-bold ${activeTab === 'specifications' ? 'active text-primary' : 'text-muted'}`}
                  onClick={() => setActiveTab('specifications')}
                >
                  Specifications
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link fw-bold ${activeTab === 'seller' ? 'active text-primary' : 'text-muted'}`}
                  onClick={() => setActiveTab('seller')}
                >
                  Store Information
                </button>
              </li>
            </ul>

            {activeTab === 'description' && (
              <div className="text-secondary leading-relaxed">
                <p>{product.description}</p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="table-responsive" style={{ maxWidth: 600 }}>
                <table className="table table-striped table-bordered mb-0">
                  <tbody>
                    {product.specifications && Object.keys(product.specifications).length > 0 ? (
                      Object.entries(product.specifications).map(([key, val]) => (
                        <tr key={key}>
                          <th className="w-40 text-muted fw-semibold" style={{ width: '40%' }}>{key}</th>
                          <td className="fw-medium text-dark">{String(val)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="text-muted text-center">No additional specifications listed.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'seller' && (
              <div className="p-3 bg-light rounded-3" style={{ maxWidth: 600 }}>
                {product.store ? (
                  <div>
                    <h5 className="fw-bold text-dark mb-2">{product.store.storeName}</h5>
                    <p className="text-muted small mb-2">{product.store.description || 'Verified seller on ShopSphere Marketplace.'}</p>
                    <div className="d-flex align-items-center gap-3 text-secondary small">
                      <span>Rating: ⭐ {product.store.rating || '4.8'}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted mb-0">Seller details unavailable.</p>
                )}
              </div>
            )}
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="my-5">
              <h3 className="fw-bold text-dark mb-4">Related Products</h3>
              <div className="row g-3">
                {relatedProducts.map((rel) => (
                  <div key={rel._id || rel.id} className="col-6 col-md-3">
                    <ProductCard product={rel} />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  );
}
