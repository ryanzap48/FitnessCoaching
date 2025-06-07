import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function AdminWorkouts() {
  const { token } = useAuth();
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:9000/workouts', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        // Add input state to each workout object
        const withEmailInput = data.map(w => ({ ...w, assignEmail: '' }));
        setWorkouts(withEmailInput);
      })
      .catch(err => console.error(err));
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workout?')) return;
    try {
      const res = await fetch(`http://localhost:9000/workouts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setWorkouts(prev => prev.filter(w => w._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssign = async (id, email) => {
    if (!email) return alert('Please enter a valid email.');
    try {
      const res = await fetch(`http://localhost:9000/workouts/${id}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userEmail: email }),
      });
      if (res.ok) {
        const updated = await res.json();
        setWorkouts(prev =>
          prev.map(w =>
            w._id === id ? { ...updated, assignEmail: '' } : w
          )
        );
      } else {
        const err = await res.json();
        alert(`❌ ${err.message || 'Assignment failed.'}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnassign = async (workoutId, userEmail) => {
    if (!window.confirm(`Unassign ${userEmail}?`)) return;
    try {
      const res = await fetch(`http://localhost:9000/workouts/${workoutId}/unassign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userEmail }),
      });
      if (res.ok) {
        const updated = await res.json();
        setWorkouts(prev =>
          prev.map(w =>
            w._id === workoutId ? { ...updated, assignEmail: '' } : w
          )
        );
      } else {
        const err = await res.json();
        alert(`❌ ${err.message || 'Unassign failed.'}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>All Workouts: {workouts.length}</h1>
      {workouts.toReversed().map((workout) => {
        const exerciseCount = workout.blocks?.reduce(
          (acc, block) => acc + (block.exercises?.length || 0),
          0
        );

        return (
          <div key={workout._id} style={{ position: 'relative' }}>
            <Link
              to={`/workout/${workout._id}`}
              style={{
                display: 'block',
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <h2>{workout.title}</h2>
              <p><strong>Duration:</strong> {workout.duration}</p>
              <p><strong>Exercises:</strong> {exerciseCount}</p>
              <p><strong>Assigned To:</strong></p>
              {workout.assignedTo?.length ? (
                <ul style={{ marginTop: '0.5rem' }}>
                  {workout.assignedTo.map(user => (
                    <li key={user._id} style={{ marginBottom: '0.25rem' }}>
                      {user.firstName} {user.lastName} ({user.email})
                      <button
                        onClick={(e) => {
                           e.preventDefault();
                           e.stopPropagation();
                           handleUnassign(workout._id, user.email);
                         }}
                        style={{
                          marginLeft: '1rem',
                          backgroundColor: '#ff7875',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.25rem 0.5rem',
                          cursor: 'pointer',
                        }}
                      >
                        Unassign
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontStyle: 'italic' }}>No one assigned.</p>
              )}
            </Link>

            <div style={{ padding: '1rem' }}>
              <input
                type="email"
                placeholder="Assign user by email"
                value={workout.assignEmail || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setWorkouts(prev =>
                    prev.map(w =>
                      w._id === workout._id ? { ...w, assignEmail: val } : w
                    )
                  );
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  marginBottom: '0.5rem',
                }}
              />
              <button
                onClick={() => handleAssign(workout._id, workout.assignEmail)}
                style={{
                  backgroundColor: '#007bff',
                  color: '#fff',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Assign User
              </button>
            </div>

            <button
              onClick={() => handleDelete(workout._id)}
              style={{
                position: 'absolute',
                bottom: '1rem',
                right: '1rem',
                backgroundColor: '#ff4d4f',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
              }}
            >
              Delete
            </button>
          </div>
        );
      })}
    </div>
  );
}
