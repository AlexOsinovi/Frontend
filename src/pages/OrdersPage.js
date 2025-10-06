import React, { useEffect, useMemo, useState } from 'react';
import { apiGetOrders } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setError('');
      setLoading(true);
      try {
        const data = await apiGetOrders();
        const arr = Array.isArray(data) ? data : [];
        const filtered = user?.id ? arr.filter((owu) => {
          const o = owu.order || owu;
          return String(o.userId) === String(user.id);
        }) : arr;
        setOrders(filtered);
      } catch (e) {
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const viewOrders = useMemo(() => orders.map((owu) => {
    const o = owu.order || owu;
    const total = (o.orderItems || []).reduce((s, oi) => s + Number(oi.item?.price || 0) * oi.quantity, 0);
    return { ...o, total: total.toFixed(2) };
  }), [orders]);

  return (
    <div className="row">
      <div className="col-12">
        <h2 className="mb-3">Orders</h2>
      </div>
с      {loading && (
        <>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="col-12 mb-3">
              <div className="card p-3">
                <div className="skeleton" style={{ height: 24, width: '50%', marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 16, width: '35%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 16, width: '25%' }} />
              </div>
            </div>
          ))}
        </>
      )}
      {error && <div className="col-12"><div className="alert alert-danger">{error}</div></div>}
      {!loading && !error && viewOrders.length === 0 && <div className="col-12"><div className="alert alert-secondary">No orders yet.</div></div>}
      {!loading && !error && (
        <div className="col-12">
          <div className="accordion" id="ordersAccordion">
            {viewOrders.map((order, idx) => (
              <div className="accordion-item" key={order.id}>
                <h2 className="accordion-header" id={`heading-${idx}`}>
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse-${idx}`} aria-expanded="false" aria-controls={`collapse-${idx}`}>
                    <div className="d-flex w-100 justify-content-between align-items-center">
                      <span className="me-3"><strong>Order:</strong> #{order.id}</span>
                      <span className="me-3"><strong>Status:</strong> {order.status}</span>
                      <span className="me-3"><strong>Date:</strong> {order.creationDate}</span>
                      <span><strong>Total:</strong> ${order.total}</span>
                    </div>
                  </button>
                </h2>
                <div id={`collapse-${idx}`} className="accordion-collapse collapse" aria-labelledby={`heading-${idx}`} data-bs-parent="#ordersAccordion">
                  <div className="accordion-body">
                    <div className="mb-2"><strong>Payment ID:</strong> {String(order.paymentId || '')}</div>
                    <ul className="list-group mb-3">
                      {(order.orderItems || []).map((orderItem) => (
                        <li key={orderItem.id} className="list-group-item d-flex justify-content-between align-items-center">
                          <span>{orderItem.item?.name} × {orderItem.quantity}</span>
                          <span>${(Number(orderItem.item?.price || 0) * orderItem.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="d-flex justify-content-end">
                      <strong>Total: ${order.total}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


