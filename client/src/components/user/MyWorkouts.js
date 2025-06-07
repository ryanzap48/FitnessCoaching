import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function MyWorkouts() {
  const { token } = useAuth();
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:9000/workouts/my', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setWorkouts(data))
      .catch(err => console.error(err));
  }, [token]);

  return (
    <div style={{ padding: '1rem' }}>
      {workouts.toReversed().map((workout, i) => (
        <Link
          to={`/workout/${workout._id}`}
          key={i}
          style={{
            display: 'block',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <h2>{workout.title}</h2>
          <p><strong>Estimated Time:</strong> {workout.duration}</p>
          <p><strong>Total Exercises:</strong> {workout.blocks.reduce((acc, block) => acc + block.exercises.length, 0)}</p>
        </Link>
      ))}
    </div>
  );
}