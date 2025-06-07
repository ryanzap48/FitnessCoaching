import React, { useState } from 'react';

export default function SecretAdmin() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdminRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:9000/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Admin created successfully!');
        setFormData({ email: '', password: '' });
      } else {
        setMessage(data.message || '❌ Failed to create admin.');
      }
    } catch (error) {
      console.error(error);
      setMessage('⚠️ Error occurred while creating admin.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '50vh', // 80px space for navbar
      paddingTop: '80px',
      backgroundColor: '#f9f9f9'
    }}>
      <form onSubmit={handleAdminRegister} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        backgroundColor: '#fff',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Admin Registration</h2>

        <input
          type="text"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{
            padding: '0.75rem',
            fontSize: '1rem',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={{
            padding: '0.75rem',
            fontSize: '1rem',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
        <button type="submit" style={{
          padding: '0.75rem',
          fontSize: '1rem',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Register
        </button>

        {message && (
          <p style={{ textAlign: 'center', color: '#333', marginTop: '1rem' }}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
