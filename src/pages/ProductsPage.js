import React, { useEffect, useMemo, useState } from 'react';
import { useCart } from '../context/CartContext';
import { apiGetItems } from '../api/client';

export default function ProductsPage() {
  const { addToCart } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setError('');
      setLoading(true);
      try {
        const data = await apiGetItems();
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const normalized = useMemo(() => items.map(it => ({
    id: it.id,
    name: it.name,
    price: Number(it.price),
  })), [items]);

  return (
    <div className="row">
      <div className="col-12">
        <h2 className="mb-3">Products</h2>
      </div>
      {loading && (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="col-12 col-sm-6 col-lg-4 mb-3">
              <div className="card h-100">
                <div className="card-body">
                  <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 12 }} />
                  <div className="skeleton" style={{ height: 16, width: '40%', marginBottom: 16 }} />
                  <div className="skeleton" style={{ height: 80, width: '100%', marginBottom: 16 }} />
                  <div className="skeleton" style={{ height: 38, width: 120 }} />
                </div>
              </div>
            </div>
          ))}
        </>
      )}
      {error && (
        <div className="col-12"><div className="alert alert-danger">{error}</div></div>
      )}
      {!loading && !error && normalized.length === 0 && (
        <div className="col-12"><div className="alert alert-secondary">No products found.</div></div>
      )}
      {normalized.map((p) => (
        <div key={p.id} className="col-12 col-sm-6 col-lg-4 mb-3">
          <div className="card h-100 shadow-sm">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">{p.name}</h5>
              <h6 className="card-subtitle mb-2 text-muted">${p.price.toFixed(2)}</h6>
              <button className="btn btn-primary mt-auto" onClick={() => addToCart(p)}>Add to cart</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


