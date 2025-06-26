import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { API_URL } from "../api/api";
import "../styles/invoices.scss";
import { useUser } from "../hooks/useUser";
import { useQuery } from "@tanstack/react-query";
import { InvoiceType } from "../api/templates";

interface Item {
  id: string;
  product_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

const InvoiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // const [invoice, setInvoice] = useState<Invoice | null>(null);
  // const [items, setItems] = useState<Item[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { data: user, isLoading: userLoading, error: userError } = useUser();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!userLoading && userError?.message === 'Unauthenticated') {
      navigate('/sign-in', { replace: true });
    }
  }, [userLoading, userError, navigate]);

  
  // useEffect(() => {
  //   fetch(`${API_URL}/invoices/${id}`, {
  //     headers: {
  //       Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  //     },
  //   })
  //     .then((res) => {
  //       if (!res.ok) throw new Error("Failed to load invoice");
  //       return res.json();
  //     })
  //     .then((data: { invoice: Invoice; items: Item[] }) => {
  //       setInvoice(data.invoice);
  //       setItems(data.items);
  //     })
  //     .catch((err) => setError(err.message))
  //     .finally(() => setLoading(false));
  // }, [id]);

  // React Query replaces your useEffect
  const { data: invoice, isLoading, error } = useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/invoices/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (!res.ok) throw new Error("Failed to load invoice");
      return (await res.json()) as { invoice: InvoiceType; items: Item[] };
    },
    enabled: !!user,               // wait until we know who the user is
    staleTime: 5 * 60_000,         // cache for 5 minutes
  });


  if (isLoading) return <p>Loading…</p>;
  if (error || !invoice)
    return <p className="error">Error: {error?.message || "Missing invoice"}</p>;


  const dt = new Date(invoice.invoice.invoice_date);
  const date = dt.toLocaleDateString("en-GB").replace(/\//g, ".");
  const time = dt.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  const grandTotal = invoice.items
    .reduce((sum, it) => sum + it.line_total, 0)
    .toFixed(2);
  return (
    <div className="invoice-details-page">
      <div className="details-card">
        <div className="details-row">
          <span className="label">Invoice #</span>
          <span className="value">{invoice.invoice.id}</span>
        </div>
        <div className="details-row">
          <span className="label">Date</span>
          <span className="value">{date}</span>
        </div>
        <div className="details-row">
          <span className="label">Time</span>
          <span className="value">{time}</span>
        </div>
        <div className="details-row">
          <span className="label">Status</span>
          <span
            className={`status-pill status-${invoice.invoice.status.toLowerCase()}`}
          >
            {invoice.invoice.status}
          </span>
        </div>
      </div>

      <div className="table-container details-table-container">
        <table className="invoices-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((it) => (
              <tr key={it.id}>
                <td>{it.description}</td>
                <td>{it.quantity}</td>
                <td>{it.unit_price.toFixed(2)} SAR</td>
                <td>{it.line_total.toFixed(2)} SAR</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grand-total">
        <span>Grand Total</span>
        <span>{grandTotal} SAR</span>
      </div>

      <Link to="/invoices" className="btn secondary back-btn">
        ← Back to Invoices
      </Link>
    </div>
  );
};

export default InvoiceDetails;
