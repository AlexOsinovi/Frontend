import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { apiCreateOrder, apiGetCardsByUser } from '../api/client';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();

  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const total = useMemo(() => (
    cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0).toFixed(2)
  ), [cartItems]);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [cartItems, navigate]);

  useEffect(() => {
    (async () => {
      try {
        if (user?.id) {
          const list = await apiGetCardsByUser(String(user.id));
          setCards(Array.isArray(list) ? list.slice(0, 3) : []);
          if (list && list.length > 0) setSelectedCardId(String(list[0].id));
        }
      } catch (_) {
        // ignore
      }
    })();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!address) {
      setError('Please fill the address field.');
      return;
    }
    if (!selectedCardId) {
      setError('Please select a payment card.');
      return;
    }
    setSubmitting(true);
    try {
      const orderRequest = {
        userId: user.id,
        creationDate: new Date().toISOString().split('T')[0],
        orderItems: cartItems.map((item) => ({ itemId: Number(item.id), quantity: item.quantity })),
        // cardId is not used by backend order API, but we enforce selection on UI level
        cardId: Number(selectedCardId),
      };
      const created = await apiCreateOrder(orderRequest);
      const orderId = created?.order?.id || created?.id;
      clearCart();
      navigate('/order-success', { replace: true, state: { orderId } });
    } catch (err) {
      setError('Failed to place order. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="row">
      <div className="col-12 col-lg-7 mb-4 mb-lg-0">
        <h2 className="mb-3">Checkout</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card p-3 shadow-sm mb-3">
          <h5>User Information</h5>
          <div className="mb-2"><strong>Name:</strong> {user?.name} {user?.surname}</div>
          <div className="mb-2"><strong>Email:</strong> {user?.email}</div>
        </div>
        <form className="card p-3 shadow-sm" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Delivery Address</label>
            <textarea className="form-control" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Payment Card</label>
            {cards.length === 0 ? (
              <div className="alert alert-warning mb-0">No cards available. Please add a card first.</div>
            ) : (
              <select className="form-select" value={selectedCardId} onChange={(e) => setSelectedCardId(e.target.value)} required>
                {cards.map((c) => (
                  <option key={c.id} value={String(c.id)}>**** **** **** {String(c.number).slice(-4)} ({c.holder})</option>
                ))}
              </select>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label">Notes (optional)</label>
            <textarea className="form-control" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="d-flex gap-2">
            <button disabled={submitting || cards.length === 0} type="submit" className="btn btn-primary">{submitting ? 'Placing order...' : 'Place Order'}</button>
            <Link className="btn btn-outline-secondary" to="/cart">Back to Cart</Link>
          </div>
        </form>
      </div>
      <div className="col-12 col-lg-5">
        <h4 className="mb-3">Order Summary</h4>
        <div className="card p-3 shadow-sm">
          <ul className="list-group mb-3">
            {cartItems.map((item) => (
              <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                <span>{item.name} × {item.quantity}</span>
                <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="d-flex justify-content-between align-items-center">
            <strong>Total</strong>
            <strong>${total}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}


