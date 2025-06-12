import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: Number(process.env.SMTP_PORT),
//   secure: !!process.env.SMTP_SECURE, // true for 465, false for other ports
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });
// Always works for Gmail in dev & prod:
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
// src/controllers/contactController.ts
export async function sendContact(req, res) {
    const { name, email, tag, message } = req.body;
    const receiver = process.env.CONTACT_RECEIVER_EMAIL;
    // 1) Validate env var
    if (!receiver) {
        console.error('Missing CONTACT_RECEIVER_EMAIL env var');
        return res.status(500).json({ error: 'Internal: no contact address configured' });
    }
    // 2) Validate required fields
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email and message are required.' });
    }
    const mailOptions = {
        from: `"${name}" <${email}>`,
        to: receiver, // must be non-empty
        subject: `New message: ${tag}`,
        text: `
  Tag: ${tag}
  From: ${name} <${email}>
  ---
  ${message}
      `,
        html: `
        <p><strong>Tag:</strong> ${tag}</p>
        <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
        <hr/>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `,
    };
    try {
        await transporter.sendMail(mailOptions);
        res.json({ ok: true });
    }
    catch (err) {
        console.error('Contact email error:', err);
        res.status(500).json({ error: 'Failed to send email: ' + err.message });
    }
}
