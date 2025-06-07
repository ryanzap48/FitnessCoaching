import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const res = await fetch('http://localhost:9000/workouts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setWorkouts(data);
      } catch (err) {
        console.error('Failed to fetch workouts', err);
      }
    };

    fetchWorkouts();
  }, [token]);

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Admin Dashboard</h2>
      <p style={subHeaderStyle}>Logged in as: {user?.name || 'Admin'} ({user?.email})</p>

      <div style={gridStyle}>
        <Link to="/adminworkouts" style={cardLinkStyle}>
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>All Workouts</h3>
            <p style={cardCountStyle}>{workouts.length} total</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

// Styles

const containerStyle = {
  padding: '2rem',
  maxWidth: '800px',
  margin: 'auto',
};

const headerStyle = {
  fontSize: '1.8rem',
  marginBottom: '0.5rem',
};

const subHeaderStyle = {
  fontSize: '1rem',
  color: '#555',
  marginBottom: '2rem',
};

const gridStyle = {
  display: 'flex',
  gap: '2rem',
  flexWrap: 'wrap',
  justifyContent: 'center',
};

const cardLinkStyle = {
  textDecoration: 'none',
  color: 'inherit',
};

const cardStyle = {
  flex: '1 1 250px',
  padding: '1.5rem',
  borderRadius: '10px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  background: 'linear-gradient(to right, #2c3e50, #34495e)',
  color: '#fff',
  textAlign: 'center',
  transition: 'transform 0.2s',
};

const cardTitleStyle = {
  fontSize: '1.2rem',
  marginBottom: '0.5rem',
};

const cardCountStyle = {
  fontSize: '1.6rem',
  fontWeight: 'bold',
};
