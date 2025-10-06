import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function OrderSuccessPage() {
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-8 col-lg-6">
        <div className="card p-4 text-center shadow-sm">
          <h2 className="mb-2">Thank you for your order!</h2>
          <p className="text-muted mb-4">{orderId ? `Order #${orderId}` : 'Your order has been placed successfully.'}</p>
          <Link to="/" className="btn btn-primary">Back to Products</Link>
        </div>
      </div>
    </div>
  );
}


