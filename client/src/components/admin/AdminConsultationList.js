import { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';

export default function AdminConsultationList() {
  const [consultations, setConsultations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchConsultations = async () => {
    const res = await fetch('http://localhost:9000/consultations');
    const data = await res.json();
    setConsultations(data);
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


   const filteredConsultations = consultations.filter(consultation => 
        consultation.firstName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div style={containerStyle}>
      <div style={{
              position: 'relative',
              width: '200px',
              marginBottom: '1rem'
            }}>
          <FaSearch style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#999'
                    }}/>
          <input
              type="text"
              placeholder="Search consultation"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                  width: '100%',
                  padding: '8px 10px 8px 35px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
              }}
          />
        </div>


      
      {filteredConsultations.length === 0 ? (
        <p style={emptyStyle}>No consultations submitted yet.</p>
      ) : (
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
              {filteredConsultations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((consult) => (
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
  padding: '1.5rem',
  margin: 'auto',
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
  borderBottom: '1px solid #ccc',
  fontSize: '0.9rem',
  backgroundColor: 'white'
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