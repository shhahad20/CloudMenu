// src/pages/InvoicesPage.tsx
import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
import { API_URL } from '../api/api';
import '../styles/invoices.scss';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
// import { Link } from 'react-router-dom';

export interface Invoice {
  id: string;
  subtotal: number;
  total: number;
  tax: number;
  status: 'Paid' | 'Draft' | 'Canceled';
  invoice_date: string;
}

const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

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

  return (
    <>
    <Navbar/>
    <div className="invoices-page">
      <h1 className='invoice-header'>Invoices</h1>
      <header className="invoices-header">
        <div className="invoices-summary">
          <span className="icon">              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M13 19.9991C12.9051 20 12.7986 20 12.677 20H7.19691C6.07899 20 5.5192 20 5.0918 19.7822C4.71547 19.5905 4.40973 19.2842 4.21799 18.9079C4 18.4801 4 17.9203 4 16.8002V7.2002C4 6.08009 4 5.51962 4.21799 5.0918C4.40973 4.71547 4.71547 4.40973 5.0918 4.21799C5.51962 4 6.08009 4 7.2002 4H16.8002C17.9203 4 18.4796 4 18.9074 4.21799C19.2837 4.40973 19.5905 4.71547 19.7822 5.0918C20 5.5192 20 6.07899 20 7.19691V12.6747C20 12.7973 20 12.9045 19.9991 13M13 19.9991C13.2857 19.9966 13.4663 19.9862 13.6388 19.9448C13.8429 19.8958 14.0379 19.8147 14.2168 19.705C14.4186 19.5814 14.5916 19.4089 14.9375 19.063L19.063 14.9375C19.4089 14.5916 19.5809 14.4186 19.7046 14.2168C19.8142 14.0379 19.8953 13.8424 19.9443 13.6384C19.9857 13.4659 19.9964 13.2855 19.9991 13M13 19.9991V14.6001C13 14.04 13 13.7598 13.109 13.5459C13.2049 13.3577 13.3577 13.2049 13.5459 13.109C13.7598 13 14.0396 13 14.5996 13H19.9991"
                  stroke="#1E1E1E"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg></span>
          <span className="count">{invoices.length}</span>
          <span className="label">Total Invoices</span>
        </div>

        <div className="invoices-controls">
          <div className="search">
            <input type="text" placeholder="Search by date, #num" />
            <span className="search-icon">🔍</span>
          </div>
          <select>
            <option>This Month</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
          <select>
            <option>All Status</option>
            <option>Paid</option>
            <option>Draft</option>
            <option>Canceled</option>
          </select>
          <button className="support-btn">Support</button>
        </div>
      </header>

      {loading && <p>Loading invoices…</p>}
      {error   && <p className="error">Error: {error}</p>}

      {!loading && !error && (
        <div className="table-container">
          <table className="invoices-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Date</th>
                <th>Time</th>
                <th>#Num</th>
                <th>Total</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => {
              const dt = new Date(inv.invoice_date);
              const date = dt.toLocaleDateString('en-GB').replace(/\//g, '.');
              const time = dt.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
              });
              return (
                
                <tr key={inv.id}>
                <td>
                  <span className={`status-pill status-${inv.status.toLowerCase()}`}>
                  {inv.status}
                  </span>
                </td>
                <td>{date}</td>
                <td>{time}</td>
                <td>#{inv.id}</td>
                <td>{inv.total.toFixed(2)} SAR</td>
                <td className="view-cell">
                    <Link to={`/invoices/${inv.id}`} className="view-link" target="_blank" rel="noopener noreferrer">
                    ⋮
                    </Link>
                </td>
                
                </tr>
                
              );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
    <Footer/>
    </>
  );
};

export default InvoicesPage;
