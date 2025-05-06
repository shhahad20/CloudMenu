import React, { useState } from 'react';
import '../styles/contact.scss';

const tags = [
  { value: 'problem', label: 'Report a Problem' },
  { value: 'suggest', label: 'Suggestion' },
  { value: 'custom',  label: 'Custom Menu Request' },
  { value: 'other',   label: 'Other' },
];

const Contact: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    tag: 'problem',
    message: '',
  });
  const [status, setStatus] = useState<'idle'|'sending'|'success'|'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus('success');
      setForm({ name: '', email: '', tag: 'problem', message: '' });
    } catch (err: unknown) {
      setStatus('error');
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Submission failed.');
      }
    }
  };

  return (
    <div className="lets-talk-page">
      <h1>Let’s Talk</h1>
      <p>Have a question or idea? Send us a message and we’ll get back to you soon.</p>

      <form className="contact-form" onSubmit={handleSubmit}>
        <label>
          Your Name
          <input name="name" type="text" required value={form.name} onChange={handleChange} />
        </label>

        <label>
          Your Email
          <input name="email" type="email" required value={form.email} onChange={handleChange} />
        </label>

        <label>
          Topic
          <select name="tag" value={form.tag} onChange={handleChange}>
            {tags.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </label>

        <label>
          Message
          <textarea
            name="message"
            rows={6}
            required
            value={form.message}
            onChange={handleChange}
          />
        </label>

        <button type="submit" disabled={status==='sending'}>
          {status==='sending' ? 'Sending…' : 'Send Message'}
        </button>

        {status==='success' && <p className="success">Thanks! We'll be in touch.</p>}
        {status==='error'   && <p className="error">{errorMsg}</p>}
      </form>
    </div>
  );
};

export default Contact;
