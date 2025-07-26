import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ExerciseModal from './exercise/ExerciseModal';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ExerciseList = () => {
    const { token } = useAuth();
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (selectedExercise) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [selectedExercise]);

    useEffect(() => {
        fetch('http://localhost:9000/exercises', {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then(res => res.json())
        .then(data => {
            setExercises(data);
        })
    }, [token]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this exercise?')) return;

        const res = await fetch(`http://localhost:9000/exercises/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
            setExercises(prev => prev.filter(w => w._id !== id));
            if (selectedExercise?._id === id) setSelectedExercise(null);
        }
    };

    const filteredExercises = exercises.filter(exercise => 
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exercise.description && exercise.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div style={containerStyle}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div style={{
                    position: 'relative',
                    width: '300px'
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
                        placeholder="Search exercises"
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
                <button
                    onClick={() => navigate('/createexercise')}
                    style={{
                        backgroundColor: '#4285f4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '9px 20px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    + Create Exercise
                </button>
            </div>
            
            {filteredExercises.length === 0 ? (
                <p style={emptyStyle}>No exercises found.</p>
            ) : (
                <div style={tableWrapperStyle}>
                    <table style={tableStyle}>
                        <thead style={{ backgroundColor: '#f5f5f5' }}>
                            <tr>
                                <th style={thStyle}>Image</th>
                                <th style={thStyle}>Name</th>
                                <th style={thStyle}>Last Updated</th>
                                <th style={thStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExercises
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map((exercise) => (
                                    <>
                                        <tr key={exercise._id} style={rowStyle}>
                                            <td style={tdStyle}>
                                                <img 
                                                    src={exercise.imageUrl || '/placeholder.png'} 
                                                    alt={exercise.name} 
                                                    style={{ 
                                                        width: '55px', 
                                                        height: '55px', 
                                                        objectFit: 'cover', 
                                                        borderRadius: '18px' 
                                                    }} 
                                                />
                                            </td>
                                            <td style={tdStyle}>
                                                <button
                                                    onClick={() => setSelectedExercise(exercise)}
                                                    style={{
                                                        border: 'none',
                                                        background: 'transparent',
                                                        fontSize: '1rem',
                                                        color: 'rgb(50, 49, 133)',
                                                        cursor: 'pointer',
                                                        textAlign: 'left'
                                                    }}
                                                >
                                                    {exercise.name}
                                                </button>
                                            </td>
                                            <td style={tdStyle}>
                                                {new Date(exercise.updatedAt).toLocaleDateString()}
                                            </td>
                                            <td style={tdStyle}>
                                                <button 
                                                    onClick={() => handleDelete(exercise._id)} 
                                                    style={buttonStyle}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                        {exercise.description && (
                                            <tr>
                                                <td colSpan="4" style={descriptionRowStyle}>
                                                    <strong>Description:</strong> {exercise.description}
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedExercise && (
                <ExerciseModal
                    exercise={selectedExercise}
                    isOpen={!!selectedExercise}
                    onClose={() => setSelectedExercise(null)}
                />
            )}
        </div>
    );
};

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

const descriptionRowStyle = {
    backgroundColor: '#fafafa',
    padding: '1rem',
    fontSize: '0.9rem',
    color: '#555',
    borderBottom: '1px solid #ddd',
};

export default ExerciseList;