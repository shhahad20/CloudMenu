import nodemailer from "nodemailer";
import "dotenv/config";
/**
 * Sends an invoice email to the given address.
 */
export async function sendInvoiceEmail(to, invoice) {
    // 1) Create transport
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: +(process.env.SMTP_PORT || 587),
        secure: +(process.env.SMTP_PORT || 587) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    // 2) Build a simple HTML table for items
    const rows = invoice.items
        .map((it) => `
      <tr>
        <td>${it.name}</td>
        <td align="right">${it.quantity}</td>
        <td align="right">${(it.price / 100).toFixed(2)}</td>
        <td align="right">${((it.price * it.quantity) / 100).toFixed(2)}</td>
      </tr>`)
        .join("");
    const html = `
    <h2>Invoice #${invoice.id}</h2>
    <p>Thank you for your purchase! Here are your invoice details:</p>
    <table width="100%" cellpadding="5" cellspacing="0" border="1">
      <thead>
        <tr>
          <th align="left">Item</th>
          <th align="right">Qty</th>
          <th align="right">Unit Price</th>
          <th align="right">Line Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" align="right"><strong>Total:</strong></td>
          <td align="right"><strong>${(invoice.amountTotal / 100).toFixed(2)} ${invoice.currency.toUpperCase()}</strong></td>
        </tr>
      </tfoot>
    </table>
    <p>Invoice created at: ${invoice.createdAt || new Date().toISOString()}</p>
    <p>Stripe Session ID: ${invoice.stripeSessionId}</p>
    <hr/>
    <p>If you have any questions, reply to this email.</p>
  `;
    // 3) Send mail
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject: `Your Invoice #${invoice.id}`,
        text: `Invoice #${invoice.id}\nTotal: ${(invoice.amountTotal / 100).toFixed(2)} ${invoice.currency.toUpperCase()}\n\nThank you for your purchase!`,
        html,
    });
}
