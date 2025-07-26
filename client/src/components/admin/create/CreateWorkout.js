import { useState } from 'react';
import { debounce } from 'lodash';

export default function CreateWorkout() {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [userEmailInput, setUserEmailInput] = useState(''); // comma-separated string
  const [blocks, setBlocks] = useState([]);
  const [message, setMessage] = useState('');


  const debouncedValidate = debounce(async (blockIdx, exIdx, exerciseName) => {
    if (!exerciseName.trim()) {
      // Clear validation when input is empty
      updateExercise(blockIdx, exIdx, { 
        validationError: '', 
        exerciseId: '' 
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:9000/exercises/validate-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ names: [exerciseName] })
      });

      const data = await response.json();

      if (data.notFoundNames.length > 0) {
        // Exercise not found
        updateExercise(blockIdx, exIdx, {
          validationError: `Exercise not found`,
          exerciseId: ''
        });
      } else {
        // Exercise found
        const foundExercise = data.foundExercises[0];
        updateExercise(blockIdx, exIdx, {
          validationError: '',
          exerciseId: foundExercise.id
        });
      }
    } catch (error) {
      console.error('Error validating exercise name:', error);
      updateExercise(blockIdx, exIdx, {
        validationError: 'Error validating exercise',
        exerciseId: ''
      });
    }
  }, 250);


  // Helper function to update a specific exercise
  const updateExercise = (blockIdx, exIdx, updates) => {
    setBlocks(prev => {
      const newBlocks = [...prev];
      newBlocks[blockIdx].exercises[exIdx] = {
        ...newBlocks[blockIdx].exercises[exIdx],
        ...updates
      };
      return newBlocks;
    });
  };

  const handleAddBlock = () => {
  setBlocks(prev => [
    ...prev,
    { 
      scheduledDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      exercises: [{ 
        name: '', 
        sets: '', 
        reps: '', 
        rest: '', 
        notes: '',
        validationError: '',
        exerciseId: ''
      }] 
    }
  ]);
};

  const handleBlockChange = (index, field, value) => {
    const newBlocks = [...blocks];
    newBlocks[index][field] = value;
    setBlocks(newBlocks);
  };

  const handleExerciseChange = (blockIdx, exIdx, field, value) => {
    const updates = { [field]: value };
    
    // If changing the name, trigger validation
    if (field === 'name') {
      debouncedValidate(blockIdx, exIdx, value);
    }
    
    updateExercise(blockIdx, exIdx, updates);
  };

  const handleAddExercise = (blockIdx) => {
    const newBlocks = [...blocks];
    newBlocks[blockIdx].exercises.push({ 
      name: '', 
      sets: '', 
      reps: '', 
      rest: '', 
      notes: '',
      validationError: '',
      exerciseId: ''
    });
    setBlocks(newBlocks);
  };

  const handleDeleteExercise = (blockIdx, exIdx) => {
    const newBlocks = [...blocks];
    newBlocks[blockIdx].exercises.splice(exIdx, 1);
    
    // If no exercises left in block, remove the entire block
    if (newBlocks[blockIdx].exercises.length === 0) {
      newBlocks.splice(blockIdx, 1);
    }
    
    setBlocks(newBlocks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Check for validation errors
    const hasValidationErrors = blocks.some(block => 
      block.exercises.some(exercise => 
        exercise.validationError && exercise.validationError.trim() !== ''
      )
    );

    if (hasValidationErrors) {
      setMessage('❌ Please fix exercise name validation errors before submitting.');
      return;
    }

    // Parse user emails
    const userEmails = userEmailInput
      .split(',')
      .map(email => email.trim())
      .filter(email => email !== '');

    // Prepare workout data - clean up the exercise objects for submission
    const workoutData = { 
      title, 
      duration, 
      blocks: blocks.map(block => ({
        scheduledDate: new Date(block.scheduledDate),
        exercises: block.exercises.map(exercise => ({
          exercise: exercise.exerciseId || null,  // ✅ Correct field name
          sets: exercise.sets,
          reps: exercise.reps,
          rest: exercise.rest,
          notes: exercise.notes
        }))
      })), 
      userEmails 
    };

    try {
      const res = await fetch('http://localhost:9000/workouts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workoutData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Workout created successfully!');
        // Clear the form
        setTitle('');
        setDuration('');
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
      fontFamily: 'sans-serif',
    },
    input: {
      width: '97%',
      padding: '0.75rem',
      marginBottom: '1rem',
      borderRadius: '6px',
      border: '1px solid #ccc',
  },
    inputError: {
      width: '100%',
      padding: '0.75rem',
      marginBottom: '0.5rem',
      borderRadius: '6px',
      border: '2px solid #dc3545',
      fontSize: '1rem',
      boxSizing: 'border-box',
    },
    validationError: {
      color: '#dc3545',
      fontSize: '0.875rem',
      marginBottom: '1rem',
      fontWeight: '500',
    },
    button: {
        border: 'none',
        borderRadius: '4px',
        padding: '9px 20px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '14px'
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
    <div style={{ 
                padding: '1.5rem',
                margin: 'auto',
                }}>
    <form onSubmit={handleSubmit} style={styles.form}>
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

    

      {blocks.map((block, blockIdx) => (
        <div key={blockIdx} style={styles.block}>
          <div style={styles.blockHeader}>
            <h3>Block {blockIdx + 1}</h3>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <input
                  type="date"
                  value={block.scheduledDate}
                  onChange={(e) => handleBlockChange(blockIdx, 'scheduledDate', e.target.value)}
                  style={{ 
                    padding: '0.4rem 1.25rem 0.4rem 0.7rem', 
                    borderRadius: '6px',
                    border: '1px solid #ccc',
                    fontSize: '14px',
                    marginRight:'2.25rem'
                  }}
                />
              </div>
          </div>

          {block.exercises.map((exercise, exIdx) => (
            <div key={exIdx} style={styles.exerciseWrapper}>
              <input
                style={exercise.validationError ? styles.inputError : styles.input}
                placeholder="Exercise Name"
                value={exercise.name}
                onChange={(e) => handleExerciseChange(blockIdx, exIdx, 'name', e.target.value)}
                required
              />
              {exercise.validationError && (
                <div style={styles.validationError}>
                  {exercise.validationError}
                </div>
              )}
              
              <input
                style={styles.input}
                placeholder="Sets (e.g. 2-3)"
                value={exercise.sets}
                onChange={(e) => handleExerciseChange(blockIdx, exIdx, 'sets', e.target.value)}
                required
              />
              <input
                style={styles.input}
                placeholder="Reps (e.g. 6-10)"
                value={exercise.reps}
                onChange={(e) => handleExerciseChange(blockIdx, exIdx, 'reps', e.target.value)}
                required
              />
              <input
                style={styles.input}
                placeholder="Rest (e.g. 2-3mins)"
                value={exercise.rest}
                onChange={(e) => handleExerciseChange(blockIdx, exIdx, 'rest', e.target.value)}
                required
              />
              <input
                style={styles.input}
                placeholder="Notes (e.g. Slow and controlled)"
                value={exercise.notes}
                onChange={(e) => handleExerciseChange(blockIdx, exIdx, 'notes', e.target.value)}
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

      <div style={{ marginBottom: '1rem' }}>
        <button
          type="button"
          onClick={handleAddBlock}
          style={{ ...styles.button, backgroundColor: '#17a2b8', color: '#fff' }}
        >
          + Add Exercise Block
        </button>
      </div>

      <button
        type="submit"
        style={{ ...styles.button, backgroundColor: '#28a745', color: '#fff' }}
      >
        Submit Workout
      </button>

      {message && <p style={styles.message}>{message}</p>}
    </form>
    </div>
  );
}