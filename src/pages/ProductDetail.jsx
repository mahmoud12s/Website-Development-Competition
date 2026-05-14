import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setSelectedImage(0);
    setQty(1);
    setAdded(false);
    fetch(`/api/products/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(p => {
        setProduct(p);
        // get sug product
        if (p.category?.slug) {
          fetch(`/api/products?category=${p.category.slug}&limit=4`)
            .then(r => r.json())
            .then(data => {
              setRelated((data.products || []).filter(rp => rp._id !== p._id).slice(0, 4));
            });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAdd = () => {
    if (!product || product.soldOut || product.stock === 0) return;
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return <div className="page"><div className="loading"><div className="spinner" /></div></div>;
  }

  if (!product) {
    return (
      <div className="page">
        <div className="empty-state" style={{ paddingTop: 120 }}>
          <div className="icon">😕</div>
          <h3>Product Not Found</h3>
          <p>The product you're looking for doesn't exist.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Go Home</Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0
    ? product.images
    : ['https://via.placeholder.com/600x450?text=No+Image'];
  const isOutOfStock = product.soldOut || product.stock === 0;

  return (
    <div className="page product-detail">
      <div className="container">
        <div className="product-detail-grid">
          {/* images */}
          <div className="product-gallery">
            <img
              src={images[selectedImage]}
              alt={product.name}
              onError={e => { e.target.src = 'https://via.placeholder.com/600x450?text=No+Image'; }}
            />
            {images.length > 1 && (
              <div className="product-gallery-thumbs">
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    className={i === selectedImage ? 'active' : ''}
                    onClick={() => setSelectedImage(i)}
                    onError={e => { e.target.src = 'https://via.placeholder.com/72'; }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            {product.category && (
              <Link
                to={`/category/${product.category.slug}`}
                className="badge badge-primary"
                style={{ marginBottom: 16, display: 'inline-flex' }}
              >
                {product.category.name}
              </Link>
            )}
            <h1>{product.name}</h1>

            {isOutOfStock ? (
              <p className="product-price" style={{ color: 'var(--danger)' }}>Out of Stock</p>
            ) : (
              <p className="product-price">${product.price?.toFixed(2)}</p>
            )}

            <div className="product-description">{product.description || 'No description available.'}</div>

            {!isOutOfStock && (
              <>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.9rem' }}>
                  {product.stock} in stock
                </p>
                <div className="product-actions">
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                    <span style={{ fontWeight: 600, minWidth: 24, textAlign: 'center' }}>{qty}</span>
                    <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
                  </div>
                  <button className="btn btn-primary" onClick={handleAdd}>
                    {added ? '✓ Added!' : '🛒 Add to Cart'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="section" style={{ paddingBottom: 0 }}>
            <div className="section-header">
              <h2>Related Products</h2>
            </div>
            <div className="grid grid-4">
              {related.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
