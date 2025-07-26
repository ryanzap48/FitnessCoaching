import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

export default function AdminWorkouts() {
  const { token } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredWorkouts = workouts.filter(workout => 
    workout.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (workout.duration && workout.duration.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={containerStyle}>
      <div style={{
        position: 'relative',
        width: '300px',
        marginBottom: '1rem'
      }}>
        <FaSearch style={{
          position: 'absolute',
          left: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#999'
        }} />
        <input
          type="text"
          placeholder="Search workouts"
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

      {filteredWorkouts.length === 0 ? (
        <p style={emptyStyle}>No workouts found.</p>
      ) : (
        filteredWorkouts.toReversed().map((workout) => {
          const exerciseCount = workout.blocks?.reduce(
            (acc, block) => acc + (block.exercises?.length || 0),
            0
          );

          return (
            <div key={workout._id} style={cardStyle}>
              <div style={cardHeaderStyle}>
                <Link
                  to={`/workout/${workout._id}`}
                  style={titleLinkStyle}
                >
                  <h2 style={titleStyle}>{workout.title}</h2>
                </Link>
                <button
                  onClick={() => handleDelete(workout._id)}
                  style={deleteButtonStyle}
                >
                  Delete
                </button>
              </div>

              <div style={cardBodyStyle}>
                <p style={infoStyle}><strong>Duration:</strong> {workout.duration}</p>
                <p style={infoStyle}><strong>Exercises:</strong> {exerciseCount}</p>
                
                <div style={assignedSectionStyle}>
                  <p style={infoStyle}><strong>Assigned To:</strong></p>
                  {workout.assignedTo?.length ? (
                    <ul style={assignedListStyle}>
                      {workout.assignedTo.map(user => (
                        <li key={user._id} style={assignedItemStyle}>
                          {user.firstName} {user.lastName} ({user.email})
                          <button
                            onClick={() => handleUnassign(workout._id, user.email)}
                            style={unassignButtonStyle}
                          >
                            Unassign
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={noAssignedStyle}>No one assigned.</p>
                  )}
                </div>

                <div style={assignInputSectionStyle}>
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
                    style={assignInputStyle}
                  />
                  <button
                    onClick={() => handleAssign(workout._id, workout.assignEmail)}
                    style={assignButtonStyle}
                  >
                    Assign User
                  </button>
                </div>
              </div>
            </div>
          );
        })
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

const cardStyle = {
  border: '1px solid #ddd',
  borderRadius: '8px',
  marginBottom: '1rem',
  boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  backgroundColor: '#fff',
};

const cardHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem',
  borderBottom: '1px solid #eee',
  backgroundColor: '#f9f9f9',
};

const titleLinkStyle = {
  textDecoration: 'none',
  color: 'inherit',
  flex: 1,
};

const titleStyle = {
  margin: 0,
  fontSize: '1.2rem',
  color: '#333',
};

const deleteButtonStyle = {
  backgroundColor: '#e74c3c',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  padding: '0.5rem 1rem',
  cursor: 'pointer',
  fontSize: '0.9rem',
};

const cardBodyStyle = {
  padding: '1rem',
};

const infoStyle = {
  margin: '0.5rem 0',
  fontSize: '0.95rem',
};

const assignedSectionStyle = {
  marginTop: '1rem',
};

const assignedListStyle = {
  marginTop: '0.5rem',
  paddingLeft: '1rem',
};

const assignedItemStyle = {
  marginBottom: '0.5rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const unassignButtonStyle = {
  backgroundColor: '#ff7875',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  padding: '0.25rem 0.5rem',
  cursor: 'pointer',
  fontSize: '0.8rem',
};

const noAssignedStyle = {
  fontStyle: 'italic',
  color: '#666',
  margin: '0.5rem 0',
};

const assignInputSectionStyle = {
  marginTop: '1rem',
  padding: '1rem',
  backgroundColor: '#fafafa',
  borderRadius: '6px',
  border: '1px solid #eee',
};

const assignInputStyle = {
  width: '100%',
  padding: '0.5rem',
  borderRadius: '6px',
  border: '1px solid #ccc',
  marginBottom: '0.5rem',
  fontSize: '0.9rem',
};

const assignButtonStyle = {
  backgroundColor: '#007bff',
  color: '#fff',
  padding: '0.5rem 1rem',
  borderRadius: '6px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.9rem',
};