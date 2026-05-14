import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [query, setQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const ref = useRef();
  const inputRef = useRef();
  const timerRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setShowFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const runSearch = (q, minP, maxP) => {
    clearTimeout(timerRef.current);
    const hasQuery = q && q.length >= 2;
    const hasPrice = minP !== '' || maxP !== '';
    if (!hasQuery && !hasPrice) {
      setResults([]);
      return;
    }
    timerRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ limit: '8' });
        if (hasQuery) params.set('q', q);
        if (minP !== '') params.set('minPrice', minP);
        if (maxP !== '') params.set('maxPrice', maxP);
        params.set('sort', 'price');
        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        setResults(data.products || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleQueryChange = (value) => {
    setQuery(value);
    runSearch(value, minPrice, maxPrice);
  };

  const handlePriceChange = (which, value) => {
    const clean = value.replace(/[^0-9.]/g, '');
    if (which === 'min') {
      setMinPrice(clean);
      runSearch(query, clean, maxPrice);
    } else {
      setMaxPrice(clean);
      runSearch(query, minPrice, clean);
    }
  };

  const clearPrice = () => {
    setMinPrice('');
    setMaxPrice('');
    runSearch(query, '', '');
  };

  const handleSelect = (slug) => {
    setQuery('');
    setOpen(false);
    setShowFilter(false);
    navigate(`/product/${slug}`);
  };

  return (
    <div className="search-wrap" ref={ref}>
      <button
        type="button"
        className="nav-icon-btn"
        onClick={() => setOpen(o => !o)}
        aria-label="Search"
      >
        <i className="fas fa-search"></i>
      </button>

      {open && (
        <div className="search-panel">
          <div className="search-panel-row">
            <div className="search-panel-input-wrap">
              <i className="fas fa-search search-icon"></i>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search products..."
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
              />
            </div>
            <button
              type="button"
              className={`nav-icon-btn filter-toggle ${showFilter || minPrice || maxPrice ? 'active' : ''}`}
              onClick={() => setShowFilter(s => !s)}
              aria-label="Price filter"
              title="Filter by price"
            >
              <i className="fas fa-sliders"></i>
            </button>
          </div>

          {showFilter && (
            <div className="search-filter">
              <div className="search-filter-title">
                <i className="fas fa-tag"></i> Price range
              </div>
              <div className="search-filter-inputs">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Min $"
                  value={minPrice}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                />
                <span className="search-filter-sep">to</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Max $"
                  value={maxPrice}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                />
                {(minPrice || maxPrice) && (
                  <button type="button" className="search-filter-clear" onClick={clearPrice}>
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="search-results">
            {loading && <div className="search-empty">Searching...</div>}
            {!loading && results.length === 0 && (query.length >= 2 || minPrice || maxPrice) && (
              <div className="search-empty">No products found</div>
            )}
            {!loading && results.map(p => (
              <div key={p._id} className="search-item" onClick={() => handleSelect(p.slug)}>
                <img
                  src={p.images?.[0] || 'https://via.placeholder.com/48'}
                  alt={p.name}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/48'; }}
                />
                <div className="search-item-info">
                  <h4>{p.name}</h4>
                  <span>${p.price?.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
