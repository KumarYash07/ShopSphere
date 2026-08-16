import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFilter, FiGrid, FiList, FiChevronDown, FiX } from 'react-icons/fi';
import MainLayout from '../components/layout/MainLayout';
import ProductCard from '../components/product/ProductCard';
import { products, categories } from '../data/dummy';

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

const PRICE_RANGES = [
  { label: 'Under ₹1,000', min: 0, max: 1000 },
  { label: '₹1,000 – ₹5,000', min: 1000, max: 5000 },
  { label: '₹5,000 – ₹20,000', min: 5000, max: 20000 },
  { label: '₹20,000 – ₹1,00,000', min: 20000, max: 100000 },
  { label: 'Over ₹1,00,000', min: 100000, max: Infinity },
];

export default function Products() {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category') || '';
  const filterType = searchParams.get('filter') || '';
  const searchQuery = searchParams.get('q') || '';

  const [sort, setSort] = useState('popular');
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [minRating, setMinRating] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const brands = [...new Set(products.map(p => p.brand))];

  let filtered = [...products];
  if (searchQuery) filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()));
  if (selectedCategory) filtered = filtered.filter(p => p.category === selectedCategory || p.subcategory === selectedCategory);
  if (filterType === 'new') filtered = filtered.filter(p => p.isNew);
  if (filterType === 'trending') filtered = filtered.slice(0, 8);
  if (filterType === 'bestsellers') filtered = filtered.filter(p => p.isBestSeller);
  if (selectedBrands.length) filtered = filtered.filter(p => selectedBrands.includes(p.brand));
  if (selectedPrice) filtered = filtered.filter(p => p.price >= selectedPrice.min && p.price < selectedPrice.max);
  if (minRating) filtered = filtered.filter(p => p.rating >= minRating);

  filtered.sort((a, b) => {
    if (sort === 'price-low') return a.price - b.price;
    if (sort === 'price-high') return b.price - a.price;
    if (sort === 'rating') return b.rating - a.rating;
    if (sort === 'newest') return b.id - a.id;
    return b.reviews - a.reviews;
  });

  const toggleBrand = (brand) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedBrands([]);
    setSelectedPrice(null);
    setMinRating(0);
    setSort('popular');
  };

  const hasFilters = selectedCategory || selectedBrands.length || selectedPrice || minRating || sort !== 'popular';

  const FilterPanel = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Categories */}
      <div>
        <h6 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Category</h6>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            className={`tag ${!selectedCategory ? 'active' : ''}`}
            style={{ justifyContent: 'flex-start' }}
            onClick={() => setSelectedCategory('')}
          >All Categories</button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`tag ${selectedCategory === cat.name ? 'active' : ''}`}
              style={{ justifyContent: 'flex-start' }}
              onClick={() => setSelectedCategory(cat.name)}
            >{cat.icon} {cat.name}</button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h6 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Price Range</h6>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {PRICE_RANGES.map(range => (
            <button
              key={range.label}
              className={`tag ${selectedPrice?.label === range.label ? 'active' : ''}`}
              style={{ justifyContent: 'flex-start' }}
              onClick={() => setSelectedPrice(selectedPrice?.label === range.label ? null : range)}
            >{range.label}</button>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <h6 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Brand</h6>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {brands.map(brand => (
            <label key={brand} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '6px 0' }}>
              <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleBrand(brand)} style={{ accentColor: 'var(--primary)', width: 15, height: 15 }} />
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h6 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Min Rating</h6>
        {[4, 3, 2].map(r => (
          <button
            key={r}
            className={`tag mb-2 ${minRating === r ? 'active' : ''}`}
            style={{ justifyContent: 'flex-start' }}
            onClick={() => setMinRating(minRating === r ? 0 : r)}
          >{'★'.repeat(r)} & above</button>
        ))}
      </div>

      {hasFilters && (
        <button className="btn-ghost" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', fontSize: 13 }} onClick={clearFilters}>
          <FiX size={14} /> Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <MainLayout>
      <div style={{ padding: '32px 24px', maxWidth: 1440, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginBottom: 4 }}>
            {searchQuery ? `Results for "${searchQuery}"` : selectedCategory || filterType ? `${selectedCategory || filterType}` : 'All Products'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{filtered.length} products found</p>
        </div>

        <div className="row g-4">
          {/* Sidebar Filters (desktop) */}
          <div className="col-lg-3 d-none d-lg-block">
            <div className="card-premium" style={{ padding: 24, position: 'sticky', top: 'calc(var(--navbar-height) + 16px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h5 style={{ fontWeight: 700, margin: 0 }}>Filters</h5>
                {hasFilters && <button onClick={clearFilters} style={{ fontSize: 12, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Clear All</button>}
              </div>
              <FilterPanel />
            </div>
          </div>

          {/* Main Content */}
          <div className="col-12 col-lg-9">
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
              <button className="btn-ghost d-lg-none" onClick={() => setShowFilters(true)}>
                <FiFilter size={14} /> Filters {hasFilters && `(Active)`}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Sort:</span>
                  <select
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                    style={{ border: '2px solid var(--secondary-200)', borderRadius: 'var(--radius-md)', padding: '7px 12px', fontSize: 13, fontFamily: 'var(--font-primary)', fontWeight: 600, color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}
                  >
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', border: '2px solid var(--secondary-200)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  {[{ mode: 'grid', Icon: FiGrid }, { mode: 'list', Icon: FiList }].map(({ mode, Icon }) => (
                    <button key={mode} onClick={() => setViewMode(mode)} style={{ padding: '7px 10px', background: viewMode === mode ? 'var(--primary)' : 'white', color: viewMode === mode ? 'white' : 'var(--text-muted)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <Icon size={16} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className="product-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="card-premium" style={{ overflow: 'hidden' }}>
                    <div className="skeleton" style={{ aspectRatio: '1/1' }} />
                    <div style={{ padding: 14 }}>
                      <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 8 }} />
                      <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 8 }} />
                      <div className="skeleton" style={{ height: 12, width: '40%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-icon">🔍</span>
                <h3 className="empty-state-title">No products found</h3>
                <p className="empty-state-text">Try adjusting your filters or search query</p>
                <button className="btn-primary-custom" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'product-grid' : 'row g-3'}>
                {filtered.map((product, i) => (
                  <motion.div
                    key={product.id}
                    className={viewMode === 'list' ? 'col-12' : ''}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showFilters && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-modal)', display: 'flex' }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowFilters(false)} />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            style={{ width: 300, background: 'white', overflowY: 'auto', padding: 24 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h5 style={{ fontWeight: 700, margin: 0 }}>Filters</h5>
              <button onClick={() => setShowFilters(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FiX size={20} /></button>
            </div>
            <FilterPanel />
            <button className="btn-primary-custom" style={{ width: '100%', justifyContent: 'center', marginTop: 24 }} onClick={() => setShowFilters(false)}>
              Apply Filters ({filtered.length} results)
            </button>
          </motion.div>
        </div>
      )}
    </MainLayout>
  );
}
