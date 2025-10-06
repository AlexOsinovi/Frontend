import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiCreateCard, apiDeleteCard, apiGetCardsByUser } from '../api/client';

export default function CardsPage() {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [number, setNumber] = useState('');
  const [holder, setHolder] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      setError('');
      setLoading(true);
      try {
        const data = await apiGetCardsByUser(String(user.id));
        setCards(Array.isArray(data) ? data : []);
      } catch (e) {
        if (e && e.status === 404) {
          setCards([]);
        } else {
          setError('Failed to load cards');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    if (cards.length >= 3) {
      setError('You can only have up to 3 cards');
      return;
    }
    if (!/^[0-9]{16}$/.test(number)) {
      setError('Card number must have 16 digits');
      return;
    }
    
    // Validate the holder name against the specified pattern ONLY.
    const holderPattern = /^[A-Z]{1,32}\s[A-Z]{1,32}$/;
    if (!holderPattern.test(holder)) {
      setError('The holder must contain only uppercase letters and follow the pattern: NAME SURNAME');
      return;
    }

    if (!expirationDate) {
      setError('Expiration date is required');
      return;
    }
    const today = new Date();
    const exp = new Date(expirationDate);
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (exp < todayDateOnly) {
      setError('Card expiration date cannot be in the past');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { number, holder, expirationDate };
      const created = await apiCreateCard(String(user.id), payload);
      setCards((prev) => [created, ...prev]);
      setNumber('');
      setHolder(''); // Reset to empty string
      setExpirationDate('');
    } catch (e) {
      setError('Failed to add card');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cardId) => {
    try {
      await apiDeleteCard(String(cardId));
      setCards((prev) => prev.filter((c) => c.id !== cardId));
    } catch (_) {
      // Errors are ignored for delete
    }
  };

  return (
    <div className="row">
      <div className="col-12">
        <h2 className="mb-3">Cards</h2>
      </div>
      {loading && <div className="col-12"><div className="alert alert-info">Loading...</div></div>}
      {error && <div className="col-12"><div className="alert alert-danger">{error}</div></div>}
      <div className="col-12 col-lg-6 mb-4">
        <form className="card p-3 shadow-sm" onSubmit={handleAdd}>
          <h5 className="mb-3">Add new card</h5>
          <div className="mb-3">
            <label className="form-label">Number (16 digits)</label>
            <input className="form-control" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="1234123412341234" maxLength={16} />
          </div>
          <div className="mb-3">
            <label className="form-label">Holder (NAME SURNAME, uppercase)</label>
            <input className="form-control" value={holder} onChange={(e) => setHolder(e.target.value)} placeholder="NAME SURNAME" />
          </div>
          <div className="mb-3">
            <label className="form-label">Expiration Date</label>
            <input type="date" className="form-control" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} />
          </div>
          <button disabled={submitting} className="btn btn-primary" type="submit">{submitting ? 'Adding...' : 'Add Card'}</button>
        </form>
      </div>
      <div className="col-12 col-lg-6">
        <div className="card p-3 shadow-sm">
          <h5 className="mb-3">Your cards</h5>
          {!loading && cards.length === 0 ? (
            <div className="text-muted">No cards</div>
          ) : (
            <ul className="list-group">
              {cards.map((c) => (
                <li key={c.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-semibold">**** **** **** {String(c.number).slice(-4)}</div>
                    <small className="text-muted">{c.holder} • exp {c.expirationDate}</small>
                  </div>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c.id)}>Delete</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}