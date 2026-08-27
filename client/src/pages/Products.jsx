import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFilter, FiX, FiRefreshCw } from 'react-icons/fi';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import ProductCard from '../components/product/ProductCard';
import { getProductsApi } from '../api/productApi';
import { getCategoriesApi } from '../api/categoryApi';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

const PRICE_RANGES = [
  { label: 'Under ₹1,000', min: 0, max: 1000 },
  { label: '₹1,000 – ₹5,000', min: 1000, max: 5000 },
  { label: '₹5,000 – ₹20,000', min: 5000, max: 20000 },
  { label: '₹20,000 – ₹1,00,000', min: 20000, max: 100000 },
  { label: 'Over ₹1,00,000', min: 100000, max: 10000000 },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get('search') || searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const sortParam = searchParams.get('sort') || 'newest';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [sortOption, setSortOption] = useState(sortParam);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync category param change
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  // Sync sort param change
  useEffect(() => {
    setSortOption(sortParam);
  }, [sortParam]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategoriesApi();
        if (data.success && data.categories) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Fetch products from backend API
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory) params.category = selectedCategory;
      if (sortOption) params.sort = sortOption;
      if (selectedPriceRange) {
        params.minPrice = selectedPriceRange.min;
        if (selectedPriceRange.max < 10000000) {
          params.maxPrice = selectedPriceRange.max;
        }
      }

      const data = await getProductsApi(params);
      if (data.success && data.products) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
      setError('Unable to load products. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, sortOption, selectedPriceRange]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    if (catId) {
      searchParams.set('category', catId);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  };

  const handleSortSelect = (sortVal) => {
    setSortOption(sortVal);
    searchParams.set('sort', sortVal);
    setSearchParams(searchParams);
  };

  const clearAllFilters = () => {
    setSelectedCategory('');
    setSelectedPriceRange(null);
    setSortOption('newest');
    setSearchParams({});
  };

  const isFiltered = selectedCategory || selectedPriceRange || searchQuery || sortOption !== 'newest';

  const SidebarFilters = () => (
    <div className="d-flex flex-column gap-4">
      {/* Category Filter */}
      <div>
        <h6 className="fw-bold text-uppercase text-muted mb-3" style={{ fontSize: 12, letterSpacing: '0.05em' }}>
          Categories
        </h6>
        <div className="list-group list-group-flush rounded-3 border-0">
          <button
            type="button"
            className={`list-group-item list-group-item-action border-0 py-2 px-3 fw-medium ${!selectedCategory ? 'bg-primary text-white active rounded-2' : 'text-dark'}`}
            onClick={() => handleCategorySelect('')}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              className={`list-group-item list-group-item-action border-0 py-2 px-3 fw-medium ${selectedCategory === cat._id ? 'bg-primary text-white active rounded-2' : 'text-dark'}`}
              onClick={() => handleCategorySelect(cat._id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h6 className="fw-bold text-uppercase text-muted mb-3" style={{ fontSize: 12, letterSpacing: '0.05em' }}>
          Price Range
        </h6>
        <div className="d-flex flex-column gap-2">
          {PRICE_RANGES.map((range) => {
            const isSelected = selectedPriceRange?.label === range.label;
            return (
              <button
                key={range.label}
                type="button"
                className={`btn btn-sm text-start py-2 px-3 rounded-2 fw-medium ${isSelected ? 'btn-primary' : 'btn-light text-secondary'}`}
                onClick={() => setSelectedPriceRange(isSelected ? null : range)}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clear Filters Button */}
      {isFiltered && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="btn btn-outline-danger btn-sm rounded-3 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
        >
          <FiX /> Clear Filters
        </button>
      )}
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="bg-light py-4 min-vh-100">
        <div className="container">
          
          {/* Header Banner */}
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 pb-2 border-bottom">
            <div>
              <h2 className="fw-bold text-dark mb-1">
                {searchQuery ? `Search results for "${searchQuery}"` : 'Browse Products'}
              </h2>
              <p className="text-muted small mb-0">
                {loading ? 'Searching catalog...' : `${products.length} products available`}
              </p>
            </div>

            {/* Sort & Mobile Filter Toggle */}
            <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
              <button
                type="button"
                className="btn btn-outline-secondary d-lg-none d-flex align-items-center gap-2 btn-sm rounded-pill px-3"
                onClick={() => setShowMobileFilters(true)}
              >
                <FiFilter /> Filters {isFiltered && <span className="badge bg-primary rounded-circle p-1"></span>}
              </button>

              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted fw-semibold">Sort By:</span>
                <select
                  className="form-select form-select-sm rounded-3 fw-semibold border-secondary-subtle"
                  value={sortOption}
                  onChange={(e) => handleSortSelect(e.target.value)}
                  style={{ minWidth: 160 }}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Desktop Sidebar Filters */}
            <div className="col-lg-3 d-none d-lg-block">
              <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top" style={{ top: 90 }}>
                <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                  <h5 className="fw-bold mb-0">Filters</h5>
                  {isFiltered && (
                    <button onClick={clearAllFilters} className="btn btn-link btn-sm text-danger text-decoration-none p-0">
                      Reset
                    </button>
                  )}
                </div>
                <SidebarFilters />
              </div>
            </div>

            {/* Main Product Grid Area */}
            <div className="col-12 col-lg-9">
              {error && (
                <div className="alert alert-danger d-flex align-items-center justify-content-between p-3 rounded-3 mb-4">
                  <div>{error}</div>
                  <button className="btn btn-sm btn-outline-danger" onClick={fetchProducts}>
                    <FiRefreshCw /> Retry
                  </button>
                </div>
              )}

              {loading ? (
                <div className="row g-3">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div key={n} className="col-6 col-md-4">
                      <div className="card border-0 shadow-sm rounded-4 p-3" style={{ height: 320 }}>
                        <div className="bg-secondary-subtle rounded-3 h-50 mb-3 animate-pulse" />
                        <div className="bg-secondary-subtle rounded w-75 h-4 mb-2 animate-pulse" />
                        <div className="bg-secondary-subtle rounded w-50 h-4 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="card border-0 shadow-sm rounded-4 text-center p-5 my-3">
                  <div className="display-4 mb-3 text-muted">🛍️</div>
                  <h4 className="fw-bold text-dark">No Products Found</h4>
                  <p className="text-muted small mb-4">
                    We couldn't find any products matching your selected criteria. Try adjusting your filters or search terms.
                  </p>
                  <div>
                    <button onClick={clearAllFilters} className="btn btn-primary rounded-pill px-4 fw-bold">
                      Clear All Filters
                    </button>
                  </div>
                </div>
              ) : (
                <div className="row g-3">
                  {products.map((product, i) => (
                    <div key={product._id || product.id} className="col-6 col-md-4">
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: i * 0.03 }}
                        className="h-100"
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Offcanvas / Modal */}
      {showMobileFilters && (
        <div className="position-fixed inset-0 z-3 d-flex" style={{ zIndex: 1060 }}>
          <div className="flex-grow-1 bg-dark opacity-50" onClick={() => setShowMobileFilters(false)} />
          <div className="bg-white p-4 overflow-y-auto" style={{ width: 300 }}>
            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-2">
              <h5 className="fw-bold mb-0">Filters</h5>
              <button className="btn-close" onClick={() => setShowMobileFilters(false)} />
            </div>
            <SidebarFilters />
            <button
              className="btn btn-primary w-100 mt-4 rounded-pill fw-bold"
              onClick={() => setShowMobileFilters(false)}
            >
              Apply Filters ({products.length})
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
