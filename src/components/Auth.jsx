import { useState } from 'react';
import { db } from '../lib/db';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('email'); // 'email' or 'code'
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError('Please enter a valid email.');
      return;
    }

    try {
      await db.auth.sendMagicCode({ email: normalizedEmail });
      setMessage('Check your email for the magic code!');
      setStep('code');
    } catch (err) {
      const apiMessage = err?.body?.message || 'Failed to send code. Please try again.';
      setError(apiMessage);
      console.error(err);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = code.trim();
    if (!normalizedCode) {
      setError('Please enter the code that was emailed to you.');
      return;
    }

    try {
      await db.auth.signInWithMagicCode({ email: normalizedEmail, code: normalizedCode });
      setMessage('Successfully signed in!');
      setStep('email');
      setEmail('');
      setCode('');
    } catch (err) {
      const apiMessage = err?.body?.message || 'Invalid code. Please try again.';
      setError(apiMessage);
      console.error(err);
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign In</h2>
      {step === 'email' ? (
        <form className="auth-form" onSubmit={handleSendCode}>
          <input
            type="email"
            className="text-input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">
            Send Magic Code
          </button>
          {message && <div className="auth-message">{message}</div>}
          {error && <div className="auth-message auth-error">{error}</div>}
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleVerifyCode}>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '16px', fontSize: '14px' }}>
            Enter the code sent to {email}
          </p>
          <input
            type="text"
            className="text-input"
            placeholder="Enter code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">
            Verify Code
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setStep('email');
              setCode('');
              setMessage('');
              setError('');
            }}
            style={{ background: 'rgba(255, 255, 255, 0.1)', marginTop: '8px' }}
          >
            Back
          </button>
          {message && <div className="auth-message">{message}</div>}
          {error && <div className="auth-message auth-error">{error}</div>}
        </form>
      )}
    </div>
  );
}

