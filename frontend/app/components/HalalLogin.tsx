'use client';

import React, { useState } from 'react';

type LoginResponse = {
  idToken?: string;
  error?: string;
};

function decodeJwtPayload(token: string) {
  const payload = token.split('.')[1];
  const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
  const paddedPayload = normalizedPayload.padEnd(
    normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
    '=',
  );

  return JSON.parse(window.atob(paddedPayload));
}

export default function HalalLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as LoginResponse;

      if (!response.ok) {
        throw new Error(data.error ?? 'Login failed.');
      }

      const token = data.idToken;
      if (token) {
        setJwtToken(token);

        const decoded = decodeJwtPayload(token);
        console.log('JWT Payload:', decoded);
        console.log('User email:', decoded.email);
        console.log('User sub (ID):', decoded.sub);

        alert('✅ Login successful! Check console for JWT token.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed.';
      setError(`❌ Login failed: ${message}`);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h1>🕌 Halal Finder - Restaurant Owner Login</h1>
      
      {jwtToken ? (
        <div style={{ backgroundColor: '#d4edda', padding: '10px', borderRadius: '4px' }}>
          <h3>✅ Authenticated!</h3>
          <p><strong>JWT Token (first 50 chars):</strong></p>
          <code style={{ fontSize: '10px', wordBreak: 'break-all' }}>
            {jwtToken.substring(0, 50)}...
          </code>
          <p style={{ marginTop: '10px', fontSize: '12px' }}>
            Open browser console (F12) to see full JWT payload
          </p>
          <button onClick={() => { setJwtToken(null); setEmail(''); setPassword(''); }} style={{ marginTop: '10px', padding: '8px 16px' }}>
            Logout
          </button>
        </div>
      ) : (
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '15px' }}>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="fatuma@example.com"
              disabled={loading}
              style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="TestPassword123!"
              disabled={loading}
              style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
            />
          </div>

          {error && <p style={{ color: 'red', fontSize: '12px' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? '⏳ Logging in...' : '🔓 Login'}
          </button>
        </form>
      )}
    </div>
  );
}
