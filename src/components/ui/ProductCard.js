import Link from 'next/link';

export default function ProductCard({ product }) {
  return (
    <div className="card h-100 shadow-sm">
      <div className="card-img-top bg-light d-flex align-items-center justify-content-center" style={{height: '200px'}}>
        <span className="text-muted">Product Image</span>
      </div>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{product.name}</h5>
        <p className="card-text text-primary fw-bold">${product.price}</p>
        <div className="mt-auto">
          <Link href={`/products/${product.id}`} className="btn btn-primary w-100">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}