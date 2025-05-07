import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_URL } from '../api/api';
import '../styles/invoices.scss';

interface Invoice { id: string; amount_cents: number; currency: string; status: string; created_at: string; }
interface Item { id: string; description: string; quantity: number; unit_cents: number; total_cents: number; }

const InvoiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice|null>(null);
  const [items, setItems]     = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string|null>(null);

  useEffect(() => {
    fetch(`${API_URL}/invoices/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load invoice');
        return res.json();
      })
      .then((data:{ invoice:Invoice; items:Item[] }) => {
        setInvoice(data.invoice);
        setItems(data.items);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading…</p>;
  if (error || !invoice) return <p className="error">Error: {error||'Missing invoice'}</p>;

  return (
    <div className="invoice-details-page">
      <h1>Invoice #{invoice.id}</h1>
      <p>Date: {new Date(invoice.created_at).toLocaleString()}</p>
      <p>Status: {invoice.status}</p>

      <table className="items-table">
        <thead>
          <tr>
            <th>Description</th><th>Qty</th><th>Unit</th><th>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map(it => (
            <tr key={it.id}>
              <td>{it.description}</td>
              <td>{it.quantity}</td>
              <td>{(it.unit_cents/100).toFixed(2)} {invoice.currency}</td>
              <td>{(it.total_cents/100).toFixed(2)} {invoice.currency}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>
        Grand Total: {(invoice.amount_cents/100).toFixed(2)} {invoice.currency}
      </h2>

      <Link to="/invoices" className="btn secondary">← Back to Invoices</Link>
    </div>
  );
};

export default InvoiceDetails;
