import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../api/api';
import '../styles/invoices.scss';

interface Invoice {
  id: string;
  subtotal: number;
  total: number;
  tax: number;
  status: string;
  invoice_date: string;
}

const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
//   const navigate = useNavigate();

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
              <th>Time</th>
              <th>Amount</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td>
                {new Date(inv.invoice_date).toLocaleString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}

                </td>
                <td>
                {new Date(inv.invoice_date).toLocaleString("en-US", {
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                  })}

                </td>
                <td>
                  {inv.total} SAR
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
