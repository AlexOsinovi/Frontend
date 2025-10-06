import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { cartItems, removeFromCart, clearCart } = useCart();

  const total = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0).toFixed(2);

  return (
    <div className="row">
      <div className="col-12">
        <h2 className="mb-3">Your Cart</h2>
      </div>

      <div className="col-12">
        <div className="card p-3 shadow-sm">
          {cartItems.length === 0 ? (
            <p className="mb-0">Your cart is empty.</p>
          ) : (
            <>
              <ul className="list-group mb-3">
                {cartItems.map((item) => (
                  <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold">{item.name}</div>
                      <small className="text-muted">${item.price} × {item.quantity}</small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="me-3">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => removeFromCart(item.id)}>Remove</button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="d-flex justify-content-between align-items-center">
                <strong>Total: ${total}</strong>
                <div className="d-flex gap-2">
                
                 <button className="btn btn-outline-danger" onClick={clearCart}>Clear cart</button>
                  <Link to="/checkout" className="btn btn-primary">Proceed to Checkout</Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}





