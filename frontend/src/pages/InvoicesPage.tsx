import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../api/api';
import '../styles/invoices.scss';

interface Invoice {
  id: string;
  amount_cents: number;
  currency: string;
  status: string;
  created_at: string;
}

const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/invoices`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load invoices');
        return res.json();
      })
      .then((data: Invoice[]) => setInvoices(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading invoices…</p>;
  if (error)   return <p className="error">Error: {error}</p>;

  return (
    <div className="invoices-page">
      <h1>Your Invoices</h1>
      {invoices.length === 0 ? (
        <p>You have no invoices yet.</p>
      ) : (
        <table className="invoices-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td>{new Date(inv.created_at).toLocaleDateString()}</td>
                <td>
                  {(inv.amount_cents / 100).toFixed(2)} {inv.currency}
                </td>
                <td>{inv.status}</td>
                <td>
                  <Link to={`/invoices/${inv.id}`}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default InvoicesPage;
