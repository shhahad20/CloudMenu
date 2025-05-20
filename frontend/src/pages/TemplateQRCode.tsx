// src/pages/TemplateQRCode.tsx
import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { fetchTemplateQR } from "../api/templates";

interface LocationState {
  qr?: string;
}

const TemplateQRCode: React.FC = () => {
  // no generic here
  const params = useParams();
  const id = params.id!;               // assume route always provides it

  // no generic here either
  const location = useLocation();
  const state = location.state as LocationState | undefined;
  const initialQr = state?.qr ?? null;

  const [qr, setQr] = useState<string | null>(initialQr);
  const [loading, setLoading] = useState<boolean>(!initialQr);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // if we already got it via state, skip fetching
    if (initialQr) return;

    setLoading(true);
    fetchTemplateQR(id)
      .then((json) => {
        if (!json.qr) throw new Error("No QR in response");
        setQr(json.qr);
      })
      .catch((err: unknown) => {
        console.error("Failed to fetch QR:", err);
        const message =
          err instanceof Error
            ? err.message
            : typeof err === "string"
            ? err
            : "Failed to load QR code.";
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [id, initialQr]);

  return (
    <>
      <Navbar />
      <main style={{ textAlign: "center", padding: "2rem" }}>
        <h1>Scan to open Menu #{id}</h1>

        {loading && <p>Loading QR code…</p>}

        {!loading && error && <p style={{ color: "red" }}>Error: {error}</p>}

        {!loading && !error && qr && (
          <img
            src={qr}
            alt={`QR code for menu ${id}`}
            style={{ maxWidth: "100%", height: "auto" }}
          />
        )}

        {!loading && !error && !qr && <p>QR code not available.</p>}
      </main>
      <Footer />
    </>
  );
};

export default TemplateQRCode;
