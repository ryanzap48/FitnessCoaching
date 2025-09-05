import { useState, useEffect } from 'react';
import { X, ChevronDown, Check, CheckCircle2 } from 'lucide-react';
import './WorkoutLogModal.css'; // CSS file for styles

const WorkoutLogModal = ({ isOpen, onClose, workoutDataInput, scheduledDate, onSubmit }) => {
  const [workoutData, setWorkoutData] = useState(null);
  const [workoutID, setWorkoutID] = useState(null);
  
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedSets, setExpandedSets] = useState({});
  const [notes, setNotes] = useState('');
  const [startTime] = useState(new Date());

  useEffect(() => {
    if (workoutDataInput && scheduledDate) {
      const fetchWorkoutData = async () => {
        setLoading(true);
        try {
          setWorkoutData(workoutDataInput);
          setWorkoutID(workoutDataInput._id);

          const initializedExercises = workoutDataInput.block.exercises.map((exercise, index) => ({
            id: exercise.exercise._id,
            name: exercise.exercise.name,
            desiredSets: parseInt(exercise.sets),
            desiredReps: exercise.reps,
            desiredWeight: exercise.rest,
            notes: exercise.notes || '',
            completed: false,
            actualSets: Array.from({ length: parseInt(exercise.sets) }, (_, i) => ({
              setNumber: i + 1,
              actualWeight: '',
              actualReps: '',
              completed: false
            }))
          }));

          setExercises(initializedExercises);
        } catch (error) {
          console.error('Error fetching workout data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchWorkoutData();
    }
  }, [workoutDataInput, scheduledDate]);

  const toggleSetExpansion = (exerciseIndex, setIndex) => {
    const key = `${exerciseIndex}-${setIndex}`;
    setExpandedSets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const updateSetData = (exerciseIndex, setIndex, field, value) => {
    setExercises(prev => {
      const updated = [...prev];
      updated[exerciseIndex].actualSets[setIndex][field] = value;
      return updated;
    });
  };

  const completeSet = (exerciseIndex, setIndex) => {
    setExercises(prev => {
      const updated = [...prev];
      const exercise = updated[exerciseIndex];
      const set = exercise.actualSets[setIndex];
      
      if (set.actualWeight && set.actualReps) {
        set.completed = true;
        
        // Check if all sets for this exercise are completed
        const allSetsCompleted = exercise.actualSets.every(s => s.completed);
        if (allSetsCompleted) {
          exercise.completed = true;
        }
        
        // Close the expanded set
        const key = `${exerciseIndex}-${setIndex}`;
        setExpandedSets(prev => ({
          ...prev,
          [key]: false
        }));
      }
      
      return updated;
    });
  };

  const allExercisesCompleted = exercises.every(ex => ex.completed);

  const handleSubmit = async () => {
    if (!allExercisesCompleted) {
      alert('Please complete all exercises before submitting');
      return;
    }

    const logData = {
      workoutID,
      scheduledDate,
      exercises: exercises.map(ex => ({
        exercise: ex.id,
        exerciseName: ex.name,
        desiredSets: ex.desiredSets,
        desiredReps: ex.desiredReps,
        desiredWeight: ex.desiredWeight,
        actualSets: ex.actualSets.filter(set => set.completed),
        completed: ex.completed,
        notes: ex.notes
      })),
      notes,
      totalDuration: Math.round((new Date() - startTime) / (1000 * 60)) // in minutes
    };

    try {
      await onSubmit(logData);
      onClose();
    } catch (error) {
      console.error('Error submitting log:', error);
      alert('Error submitting workout log');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {loading ? 'Loading...' : workoutData?.title || 'Log Workout'}
          </h2>
          <button
            onClick={onClose}
            className="close-button"
          >
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading workout data...</p>
          </div>
        ) : (
          <>
            {/* Exercise List */}
            <div className="exercise-list">
              {exercises.map((exercise, exerciseIndex) => (
                <div key={exercise.id} className="exercise-item">
                  {/* Exercise Header */}
                  <div className="exercise-header">
                    <div className="exercise-header-left">
                      <h3 className="exercise-name">{exercise.name}</h3>
                      {exercise.completed && (
                        <CheckCircle2 className="completed-icon" size={20} />
                      )}
                    </div>
                    <span className="exercise-target">
                      {exercise.desiredSets} sets × {exercise.desiredReps} reps
                    </span>
                  </div>

                  {/* Sets */}
                  <div className="sets-container">
                    {exercise.actualSets.map((set, setIndex) => {
                      const isExpanded = expandedSets[`${exerciseIndex}-${setIndex}`];
                      
                      return (
                        <div key={setIndex} className="set-item">
                          {/* Set Summary Row */}
                          <div
                            className={`set-summary ${set.completed ? 'set-completed' : ''}`}
                            onClick={() => !set.completed && toggleSetExpansion(exerciseIndex, setIndex)}
                            style={{ cursor: set.completed ? 'default' : 'pointer' }}
                          >
                            <div className="set-info">
                              <span className="set-number">Set {set.setNumber}</span>
                              <span className="set-target">
                                Target: {exercise.desiredWeight}lbs × {exercise.desiredReps}
                              </span>
                              {set.completed && (
                                <span className="set-actual">
                                  Completed: {set.actualWeight}lbs × {set.actualReps}
                                </span>
                              )}
                            </div>
                            <div className="set-status">
                              {set.completed ? (
                                <CheckCircle2 className="completed-icon" size={20} />
                              ) : (
                                <ChevronDown
                                  className={`chevron ${isExpanded ? 'chevron-rotated' : ''}`}
                                  size={20}
                                />
                              )}
                            </div>
                          </div>

                          {/* Expanded Set Input */}
                          {isExpanded && !set.completed && (
                            <div className="set-input-container">
                              <div className="set-inputs">
                                <div className="input-group">
                                  <label className="input-label">
                                    Weight (lbs)
                                  </label>
                                  <input
                                    type="number"
                                    value={set.actualWeight}
                                    onChange={(e) => updateSetData(exerciseIndex, setIndex, 'actualWeight', e.target.value)}
                                    className="input-field"
                                    placeholder={exercise.desiredWeight}
                                  />
                                </div>
                                <div className="input-group">
                                  <label className="input-label">
                                    Reps
                                  </label>
                                  <input
                                    type="number"
                                    value={set.actualReps}
                                    onChange={(e) => updateSetData(exerciseIndex, setIndex, 'actualReps', e.target.value)}
                                    className="input-field"
                                    placeholder={exercise.desiredReps}
                                  />
                                </div>
                                <button
                                  onClick={() => completeSet(exerciseIndex, setIndex)}
                                  disabled={!set.actualWeight || !set.actualReps}
                                  className="complete-button"
                                >
                                  <Check size={16} />
                                  Complete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Notes Section */}
            <div className="notes-section">
              <label className="notes-label">
                Workout Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="notes-textarea"
                placeholder="How did this workout feel? Any observations or modifications?"
              />
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <div className="progress-text">
                {exercises.filter(ex => ex.completed).length} of {exercises.length} exercises completed
              </div>
              <div className="footer-buttons">
                <button
                  onClick={onClose}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!allExercisesCompleted}
                  className="submit-button"
                >
                  Submit Workout Log
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WorkoutLogModal;