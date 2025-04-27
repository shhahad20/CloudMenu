// src/components/ConfirmEmailSent.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/confirmEmail.scss';

const ConfirmEmailSent: React.FC = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const { search } = useLocation();

  // grab the email we passed in the query string
  useEffect(() => {
    const params = new URLSearchParams(search);
    setEmail(params.get('email') ?? '');
  }, [search]);

  return (
    <div className="signup-container">
      <div className="gradient-section">
        <div className="inner-signup-header">
          <h1>Almost There!</h1>
          <p>We’ve sent a confirmation link to:</p>
          {email && <p className="confirm-email">{email}</p>}
          <p>Please check your inbox and click the link to activate your account.</p>
        </div>
      </div>

      <div className="form-section">
        <h2 className="signup-header">Confirm Your Email</h2>
        <p className="signup-subheader">
          Didn’t get the email? Check your spam folder or  
          <button 
            className="link-button" 
            onClick={() => navigate(`/sign-up?resend=true&email=${email}`)}
          >
            resend it
          </button>
        </p>
        <button 
          className="back-sigin-btn" 
          onClick={() => navigate('/sign-in')}
        >
          Go to Sign In
        </button>
      </div>
    </div>
  );
};

export default ConfirmEmailSent;
