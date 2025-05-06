import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: !!process.env.SMTP_SECURE,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
export async function sendContact(req, res) {
    const { name, email, tag, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).send('Missing fields');
    }
    const mailOptions = {
        from: `"${name}" <${email}>`,
        to: process.env.CONTACT_RECEIVER_EMAIL,
        subject: `New “Let's Talk” message: ${tag}`,
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
        res.status(500).json({ error: 'Failed to send email' });
    }
}
