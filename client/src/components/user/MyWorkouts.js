import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function MyWorkouts() {
  const { token } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:9000/workouts/my', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setWorkouts(data);
        
        // If user has exactly one workout, redirect to it
        if (data && data.length === 1) {
          navigate(`/workout/${data[0]._id}`, { replace: true });
        } else {
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [token, navigate]);

  if (loading) {
    return (
      <div style={{ 
        padding: '1rem',
        textAlign: 'center',
      }}>
        <p style={{ 
          fontSize: '1.1rem',
          color: '#666',
          marginTop: '2rem'
        }}>
          <strong>Loading your workouts... </strong>
        </p>
      </div>
    );
  }

  // If no workouts
  if (workouts.length === 0) {
    return (
      <div style={{ 
        padding: '1rem',
        textAlign: 'center',
      }}>
        <p style={{ 
          fontSize: '1.1rem',
          color: '#666',
          marginTop: '4rem'
        }}>
          No workouts assigned yet.
        </p>
      </div>
    );
  }
}