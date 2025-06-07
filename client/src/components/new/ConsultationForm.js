import { useState } from 'react';

export default function ConsultationForm() {
  const [formData, setFormData] = useState({ firstName: '', phone: '', message: '' });
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);

    try {
      const res = await fetch('http://localhost:9000/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setMessage(data.message);

      if (res.ok) {
        setSuccess(true);
        setFormData({ firstName: '', phone: '', message: '' });
      }
    } catch (error) {
      setMessage('⚠️ An error occurred. Please try again.');
      console.error(error);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      paddingTop: '80px',
      backgroundColor: '#f9f9f9'
    }}>
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '2rem',
        paddingBottom: '1rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        backgroundColor: '#fff',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Request a Consultation</h2>

        <input
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
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
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
          style={{
            padding: '0.75rem',
            fontSize: '1rem',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
        <textarea
          name="message"
          placeholder="Message (optional)"
          value={formData.message}
          onChange={handleChange}
          rows={3}
          style={{
            padding: '0.75rem',
            fontSize: '1rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
            resize: 'none', // allows vertical resizing
                  // same as input and button height
          }}
        />
        <button type="submit" style={{
          padding: '0.75rem',
          fontSize: '1rem',
          backgroundColor: '#28a745',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Submit
        </button>

        {/* Fixed-height message area so layout doesn't shift */}
        <div style={{
          minHeight: '1.5rem',
          textAlign: 'center'
        }}>
          {message && (
            <p style={{ color: success ? 'green' : 'red', margin: 0 }}>
              {message}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
