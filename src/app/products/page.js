import Link from 'next/link';

// Mock data - replace with actual data fetching
const products = [
  { id: 1, name: 'Product 1', price: 29.99, image: '/placeholder.jpg' },
  { id: 2, name: 'Product 2', price: 39.99, image: '/placeholder.jpg' },
  { id: 3, name: 'Product 3', price: 49.99, image: '/placeholder.jpg' },
  { id: 4, name: 'Product 4', price: 59.99, image: '/placeholder.jpg' },
];

export default function Products() {
  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">Our Products</h1>
        </div>
      </div>
      
      <div className="row">
        {products.map((product) => (
          <div key={product.id} className="col-md-6 col-lg-3 mb-4">
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
          </div>
        ))}
      </div>
    </div>
  );
}