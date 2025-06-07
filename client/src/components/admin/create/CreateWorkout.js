import React, { useState } from 'react';
import exerciseImageMap from '../../../image-mapping/exerciseImageMap';

export default function CreateWorkout() {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [equipment, setEquipment] = useState([]);
  const [userEmailInput, setUserEmailInput] = useState(''); // comma-separated string
  const [blocks, setBlocks] = useState([]);
  const [message, setMessage] = useState('');

  const handleAddBlock = () => {
    setBlocks(prev => [
      ...prev,
      { type: 'regular', exercises: [{ name: '', sets: '', imageUrl: '', notes: '' }] }
    ]);
  };

  const handleBlockChange = (index, field, value) => {
    const newBlocks = [...blocks];
    newBlocks[index][field] = value;
    setBlocks(newBlocks);
  };

  const handleExerciseChange = (blockIdx, exIdx, field, value) => {
    const newBlocks = [...blocks];
    const exercise = newBlocks[blockIdx].exercises[exIdx];
    exercise[field] = value;

    if (field === 'name') {
      const normalizedName = value.trim().toLowerCase();
      const mappedImage = exerciseImageMap[normalizedName];
      if (mappedImage && !exercise.imageUrl) {
        exercise.imageUrl = mappedImage;
      }
    }

    setBlocks(newBlocks);
  };

  const handleAddExercise = (blockIdx) => {
    const newBlocks = [...blocks];
    newBlocks[blockIdx].exercises.push({ name: '', sets: '', imageUrl: '', notes: '' });
    setBlocks(newBlocks);
  };

  const handleDeleteExercise = (blockIdx, exIdx) => {
    const newBlocks = [...blocks];
    newBlocks[blockIdx].exercises.splice(exIdx, 1);
    if (newBlocks[blockIdx].exercises.length === 0) {
      newBlocks.splice(blockIdx, 1);
    }
    setBlocks(newBlocks);
  };

  const toggleEquipment = (item) => {
    setEquipment(prev =>
      prev.includes(item) ? prev.filter(e => e !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Split the comma-separated string into an array of trimmed emails
    const userEmails = userEmailInput
      .split(',')
      .map(email => email.trim())
      .filter(email => email !== '');

    const workoutData = { title, duration, equipment, blocks, userEmails };

    try {
      const res = await fetch('http://localhost:9000/workouts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workoutData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Workout created successfully!');
        // Optionally clear the form:
        setTitle('');
        setDuration('');
        setEquipment([]);
        setUserEmailInput('');
        setBlocks([]);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ An unexpected error occurred.');
    }
  };

  const styles = {
    form: {
      maxWidth: '800px',
      margin: '2rem auto',
      padding: '2rem',
      background: '#f8f9fa',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      fontFamily: 'Arial, sans-serif',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      marginBottom: '1rem',
      borderRadius: '6px',
      border: '1px solid #ccc',
      fontSize: '1rem',
      boxSizing: 'border-box',
    },
    sectionTitle: {
      margin: '2rem 0 1rem',
      fontSize: '1.25rem',
      fontWeight: 'bold',
    },
    button: {
      padding: '0.6rem 1.2rem',
      fontSize: '1rem',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      marginRight: '0.5rem',
      marginBottom: '0.5rem',
    },
    deleteButton: {
      backgroundColor: '#dc3545',
      color: '#fff',
      border: 'none',
      padding: '0.4rem 0.8rem',
      borderRadius: '4px',
      fontSize: '0.9rem',
      cursor: 'pointer',
      marginTop: '-0.5rem',
    },
    equipmentButton: (active) => ({
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      border: '1px solid #ccc',
      backgroundColor: active ? '#007BFF' : '#f1f1f1',
      color: active ? '#fff' : '#000',
      marginRight: '0.5rem',
      marginBottom: '0.5rem',
      cursor: 'pointer',
    }),
    block: {
      padding: '1rem',
      marginBottom: '2rem',
      backgroundColor: '#fff',
      border: '1px solid #ddd',
      borderRadius: '8px',
    },
    blockHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
    },
    exerciseWrapper: {
      border: '1px solid #eee',
      padding: '1rem',
      borderRadius: '6px',
      marginBottom: '1rem',
      backgroundColor: '#fafafa',
      position: 'relative',
    },
    message: {
      marginTop: '1rem',
      fontWeight: 'bold',
      color: message.startsWith('✅') ? '#28a745' : '#dc3545',
    },
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Create New Workout</h2>

      {/* Title */}
      <input
        style={styles.input}
        placeholder="Workout Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      {/* Duration */}
      <input
        style={styles.input}
        placeholder="Duration (e.g. 35 minutes)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        required
      />

      {/* User Emails (comma-separated) */}
      <input
        style={styles.input}
        placeholder="Optional: Assign to Emails (comma-separated)"
        value={userEmailInput}
        onChange={(e) => setUserEmailInput(e.target.value)}
      />

      {/* Equipment selection */}
      <div style={styles.sectionTitle}>Select Equipment:</div>
      <div>
        {['Body weight', 'Cable', 'Swiss ball'].map((eq) => (
          <button
            type="button"
            key={eq}
            onClick={() => toggleEquipment(eq)}
            style={styles.equipmentButton(equipment.includes(eq))}
          >
            {equipment.includes(eq) ? `✓ ${eq}` : eq}
          </button>
        ))}
      </div>

      {/* Blocks & Exercises */}
      {blocks.map((block, blockIdx) => (
        <div key={blockIdx} style={styles.block}>
          <div style={styles.blockHeader}>
            <h3>Block {blockIdx + 1}</h3>
            <select
              value={block.type}
              onChange={(e) => handleBlockChange(blockIdx, 'type', e.target.value)}
              style={{ padding: '0.4rem', borderRadius: '6px' }}
            >
              <option value="regular">Regular</option>
              <option value="superset">Superset</option>
            </select>
          </div>

          {block.exercises.map((ex, exIdx) => (
            <div key={exIdx} style={styles.exerciseWrapper}>
              <input
                style={styles.input}
                placeholder="Exercise Name"
                value={ex.name}
                onChange={(e) =>
                  handleExerciseChange(blockIdx, exIdx, 'name', e.target.value)
                }
                required
              />
              <input
                style={styles.input}
                placeholder="Sets (e.g. 15/30)"
                value={ex.sets}
                onChange={(e) =>
                  handleExerciseChange(blockIdx, exIdx, 'sets', e.target.value)
                }
                required
              />
              <input
                style={styles.input}
                placeholder="Image URL"
                value={ex.imageUrl}
                onChange={(e) =>
                  handleExerciseChange(blockIdx, exIdx, 'imageUrl', e.target.value)
                }
              />
              <input
                style={styles.input}
                placeholder="Notes (e.g. Rest 60 sec)"
                value={ex.notes}
                onChange={(e) =>
                  handleExerciseChange(blockIdx, exIdx, 'notes', e.target.value)
                }
              />

              <button
                type="button"
                onClick={() => handleDeleteExercise(blockIdx, exIdx)}
                style={styles.deleteButton}
              >
                🗑️ Remove Exercise
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => handleAddExercise(blockIdx)}
            style={{ ...styles.button, backgroundColor: '#6c757d', color: '#fff' }}
          >
            + Add Exercise
          </button>
        </div>
      ))}

      {/* Add another block */}
      <div style={{ marginBottom: '1rem' }}>
        <button
          type="button"
          onClick={handleAddBlock}
          style={{ ...styles.button, backgroundColor: '#17a2b8', color: '#fff' }}
        >
          + Add Exercise Block
        </button>
      </div>

      {/* Submit */}
      <button
        type="submit"
        style={{ ...styles.button, backgroundColor: '#28a745', color: '#fff' }}
      >
        Submit Workout
      </button>

      {message && <p style={styles.message}>{message}</p>}
    </form>
  );
}
