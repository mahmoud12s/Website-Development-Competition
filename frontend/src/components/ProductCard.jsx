import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const imageUrl = product.images?.[0]
    ? (product.images[0].startsWith('http') ? product.images[0] : product.images[0])
    : 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <div className="product-card" onClick={() => navigate(`/product/${product.slug}`)}>
      <img
        className="product-card-image"
        src={imageUrl}
        alt={product.name}
        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
      />
      <div className="product-card-body">
        <h3>{product.name}</h3>
        {product.category && (
          <span className="badge badge-primary" style={{ marginBottom: 8, alignSelf: 'flex-start' }}>
            {product.category.name}
          </span>
        )}
        {product.soldOut || product.stock === 0 ? (
          <p className="out-of-stock">Out of Stock</p>
        ) : (
          <p className="price">${product.price?.toFixed(2)}</p>
        )}
      </div>
    </div>
  );
}
