import React, { useEffect, useState } from 'react';

export default function AdminUserList() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const res = await fetch('http://localhost:9000/users');
    const data = await res.json();
    setUsers(data);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await fetch(`http://localhost:9000/users/${id}`, { method: 'DELETE' });
      setUsers(users.filter(user => user._id !== id));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>All Users</h2>

      {users.length === 0 ? (
        <p style={emptyStyle}>No users found.</p>
      ) : (
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead style={{ backgroundColor: '#f5f5f5' }}>
              <tr>
                <th style={thStyle}>Full Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Created At</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(user => (
                <tr key={user._id} style={rowStyle}>
                  <td style={tdStyle}>{user.firstName} {user.lastName}</td>
                  <td style={tdStyle}>{user.email}</td>
                  <td style={tdStyle}>{new Date(user.createdAt).toLocaleString()}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleDelete(user._id)}
                      style={buttonStyle}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
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
