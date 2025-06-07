import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';


export default function WorkoutDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const [workout, setWorkout] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:9000/workouts/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setWorkout(data))
      .catch(err => console.error(err));
  }, [id, token]);

  if (!workout) return;

  return (
    <div style={{ padding: '1rem' }}>
        <button style={{ border: 'none', background:'none', fontFamily: 'inherit', fontSize: '1rem' }} onClick={() => navigate(-1)}>
            <span >&lt; </span>
            <span className="back-text">Back</span>
        </button>
      <h1>{workout.title}</h1>
      <p><strong>Estimated Time:</strong> {workout.duration}</p>
      <p><strong>Equipment:</strong> {workout.equipment.join(', ')}</p>

      {workout.blocks.map((block, blockIdx) => (
        <div key={blockIdx} style={{ marginTop: '1rem' }}>
          {block.type === 'superset' ? (
            <div style={{ borderLeft: '5px solid #ff9800', paddingLeft: '1rem' }}>
              <p style={{ fontWeight: 'bold', color: '#ff9800' }}>
                Superset of {block.exercises.length} exercises
              </p>
              {block.exercises.map((ex, exIdx) => (
                <div key={exIdx} style={{ marginBottom: '0.5rem', padding: '0.5rem', background: '#fffbe6', borderRadius: '6px' }}>
                  <p><strong>{ex.name}</strong></p>
                  {ex.imageUrl && <img src={ex.imageUrl} alt={ex.name} style={{ width: '100px', borderRadius: '4px' }} />}
                  <p>Sets: {ex.sets}</p>
                  {ex.notes && <p>{ex.notes}</p>}
                </div>
              ))}
            </div>
          ) : (
            block.exercises.map((ex, exIdx) => (
              <div key={exIdx} style={{ background: '#f0f0f0', padding: '0.75rem', borderRadius: '6px', marginBottom: '0.5rem' }}>
                <p><strong>{ex.name}</strong></p>
                {ex.imageUrl && <img src={ex.imageUrl} alt={ex.name} style={{ width: '100px', borderRadius: '4px' }} />}
                <p>Sets: {ex.sets}</p>
                {ex.notes && <p>{ex.notes}</p>}
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  );
}
