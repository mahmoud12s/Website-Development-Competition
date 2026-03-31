import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const ref = useRef();
  const timerRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (value) => {
    setQuery(value);
    clearTimeout(timerRef.current);
    if (value.length < 2) { setResults([]); setShowDropdown(false); return; }

    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(value)}&limit=6`);
        const data = await res.json();
        setResults(data.products || []);
        setShowDropdown(true);
      } catch { setResults([]); }
    }, 300);
  };

  const handleSelect = (slug) => {
    setQuery('');
    setShowDropdown(false);
    navigate(`/product/${slug}`);
  };

  return (
    <div className="search-container" ref={ref}>
      <i className="fas fa-search search-icon"></i>
      <input
        type="text"
        placeholder="Search products..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => results.length > 0 && setShowDropdown(true)}
      />
      {showDropdown && results.length > 0 && (
        <div className="search-dropdown">
          {results.map(p => (
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
      )}
    </div>
  );
}
