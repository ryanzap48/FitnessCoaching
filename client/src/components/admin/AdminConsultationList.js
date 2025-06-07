import { useEffect, useState } from 'react';

export default function AdminConsultationList() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchConsultations = async () => {
    try {
      const res = await fetch('http://localhost:9000/consultations');
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to fetch consultations');

      setConsultations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this consultation?')) {
      await fetch(`http://localhost:9000/consultations/${id}`, { method: 'DELETE' });
      setConsultations(consultations.filter(c => c._id !== id));
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Consultation Requests</h2>

      {loading && <p>Loading consultations...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && consultations.length === 0 && (
        <p style={emptyStyle}>No consultations submitted yet.</p>
      )}

      {!loading && consultations.length > 0 && (
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead style={{ backgroundColor: '#f5f5f5' }}>
              <tr>
                <th style={thStyle}>First Name</th>
                <th style={thStyle}>Phone</th>
                
                <th style={thStyle}>Submitted</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {consultations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((consult) => (
                <>
                  <tr key={consult._id} style={rowStyle}>
                    <td style={tdStyle}>{consult.firstName}</td>
                    <td style={tdStyle}>{consult.phone}</td>
                    <td style={tdStyle}>{new Date(consult.createdAt).toLocaleString()}</td>
                    <td style={tdStyle}>
                      <button onClick={() => handleDelete(consult._id)} style={buttonStyle}>
                        Delete
                      </button>
                    </td>
                  </tr>
                  {consult.message && (
                    <tr>
                      <td colSpan="4" style={messageRowStyle}>
                        <strong>Message:</strong> {consult.message}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const containerStyle = {
  padding: '2rem',
  maxWidth: '1000px',
  margin: 'auto',
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '2rem',
  fontSize: '1.5rem'
};

const emptyStyle = {
  textAlign: 'center',
  fontSize: '1.1rem'
};

const tableWrapperStyle = {
  overflowX: 'auto',
};

const tableStyle = {
  width: '100%',
  minWidth: '600px',
  borderCollapse: 'collapse',
  boxShadow: '0 0 10px rgba(0,0,0,0.1)',
};

const thStyle = {
  padding: '1rem',
  textAlign: 'left',
  fontWeight: 'bold',
  borderBottom: '2px solid #ccc',
  fontSize: '1rem',
};

const tdStyle = {
  padding: '1rem',
  fontSize: '0.95rem',
  wordBreak: 'break-word',
};

const rowStyle = {
  borderBottom: '1px solid #ddd',
};

const buttonStyle = {
  padding: '0.4rem 0.8rem',
  backgroundColor: '#e74c3c',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '0.9rem',
};

const messageRowStyle = {
  backgroundColor: '#fafafa',
  padding: '1rem',
  fontSize: '0.9rem',
  color: '#555',
  borderBottom: '1px solid #ddd',
};