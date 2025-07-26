import React from 'react';
import { X } from 'lucide-react';

const WorkoutDayModal = ({ isOpen, onClose, date, workouts, onExerciseClick, isClient }) => {
  if (!isOpen) return null;

  const formatDate = (date) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <X size={24} color="#6b7280" />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '2rem', paddingRight: '3rem' }}>
          {isClient ? (
          <>
          <h2 style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '0.5rem'
                }}>
                {(() => {
                    const today = new Date();
                    const isToday = 
                    date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear();
                    return isToday ? "Today's Workout" : "Workout Details";
                })()}
                </h2>
                </>
          ) : (
            <h2 style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '0.5rem'
                }}>
                Workout Details
                </h2>
          )}

        <p style={{
            margin: 0,
            color: '#6b7280',
            fontSize: '1rem'
          }}>
            {formatDate(date)}
          </p>
        </div>

        {/* Workouts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {workouts.map((workoutData, workoutIdx) => (
            <div
              key={workoutIdx}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1.5rem',
                backgroundColor: '#f9fafb'
              }}
            >
              {/* Workout Block Info */}
              <div style={{
                marginBottom: '1rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  {workoutData.name || 'Workout Block'}
                </h3>
                {workoutData.block.notes && (
                  <p style={{
                    margin: '0.5rem 0 0 0',
                    color: '#6b7280',
                    fontSize: '0.9rem'
                  }}>
                    {workoutData.block.notes}
                  </p>
                )}
              </div>

              {/* Exercises */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {workoutData.block.exercises && workoutData.block.exercises.map((ex, exIdx) => (
                  <div
                    key={exIdx}
                    style={{
                      backgroundColor: 'white',
                      padding: '1rem',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <button
                        onClick={() => onExerciseClick(ex.exercise)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          fontSize: '1rem',
                          fontWeight: '500',
                          color: '#2563eb',
                          textDecoration: 'none',
                          textAlign: 'left'
                        }}
                        onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                        onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                      >
                        {ex.exercise?.name || 'Unnamed Exercise'}
                      </button>
                      
                      {ex.exercise?.description && (
                        <p style={{
                          margin: '0.25rem 0 0 0',
                          color: '#6b7280',
                          fontSize: '0.85rem'
                        }}>
                          {ex.exercise.description}
                        </p>
                      )}
                    </div>
                    
                    <div style={{
                      backgroundColor: '#f3f4f6',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginLeft: '1rem'
                    }}>
                      {ex.sets} sets × {ex.reps} reps
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkoutDayModal;