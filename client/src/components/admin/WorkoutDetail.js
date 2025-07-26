import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ExerciseModal from './exercise/ExerciseModal';
import WorkoutDayModal from './WorkoutDayModal'; // Adjust path as needed

export default function WorkoutCalendar() {
  const { id } = useParams();
  const { token, role } = useAuth();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek);
    return weekStart;
  });
  const [workouts, setWorkouts] = useState(null); // Changed from [] to null
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:9000/workouts/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        console.log('Full workout data:', data);
        console.log('First block:', data.blocks?.[0]);
        console.log('First exercise:', data.blocks?.[0]?.exercises?.[0]);
        console.log('Exercise object:', data.blocks?.[0]?.exercises?.[0]?.exercise);
        setWorkouts(data);
      })
      .catch(err => console.error(err));
  }, [id, token]);

  // Show loading state while fetching
  if (!workouts) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        Loading workout...
      </div>
    );
  }

  const getWeekDays = (weekStart) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getWorkoutsForDate = (date) => {
    if (!date || !workouts || !workouts.blocks) return [];
    
    const workoutsOnDate = [];
    // Handle single workout object (not array)
    workouts.blocks.forEach(block => {
      const blockDate = new Date(block.scheduledDate);
      if (
        blockDate.getDate() === date.getDate() &&
        blockDate.getMonth() === date.getMonth() &&
        blockDate.getFullYear() === date.getFullYear()
      ) {
        workoutsOnDate.push({
          ...workouts, // Use the single workout object
          block: block
        });
      }
    });
    
    return workoutsOnDate;
  };

  const handleDayClick = (day, workoutsOnDay) => {
  if (workoutsOnDay.length > 0) {
    setSelectedDay({
      date: day,
      workouts: workoutsOnDay
    });
  }
};

  const navigateWeek = (direction) => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction * 7));
      return newDate;
    });
  };

  const formatWeekRange = (weekStart) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const options = { month: 'short', day: 'numeric' };
    const startStr = weekStart.toLocaleDateString('en-US', options);
    const endStr = weekEnd.toLocaleDateString('en-US', options);
    
    if (weekStart.getFullYear() !== weekEnd.getFullYear()) {
      return `${startStr}, ${weekStart.getFullYear()} - ${endStr}, ${weekEnd.getFullYear()}`;
    } else if (weekStart.getMonth() !== weekEnd.getMonth()) {
      return `${startStr} - ${endStr}, ${weekEnd.getFullYear()}`;
    } else {
      return `${startStr} - ${endStr}, ${weekEnd.getFullYear()}`;
    }
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekDays = getWeekDays(currentWeekStart);

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      {/* Week Navigation Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '0 1rem'
      }}>
        <button
          onClick={() => navigateWeek(-1)}
          style={{
            background: 'none',
            border: '1px solid #ddd',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <ChevronLeft size={20} />
        </button>
        
        <h2 style={{ margin: 0, textAlign: 'center' }}>
          {formatWeekRange(currentWeekStart)}
        </h2>
        
        <button
          onClick={() => navigateWeek(1)}
          style={{
            background: 'none',
            border: '1px solid #ddd',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Weekly Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        {weekDays.map((day, index) => {
          const workoutsOnDay = getWorkoutsForDate(day);
          const isToday = 
            day.getDate() === new Date().getDate() &&
            day.getMonth() === new Date().getMonth() &&
            day.getFullYear() === new Date().getFullYear();

          return (
            <div
              key={index}
              onClick={() => handleDayClick(day, workoutsOnDay)}
              style={{
                height: '75vh',
                backgroundColor: 'white',
                padding: '1rem',
                borderRadius: '8px',
                border: isToday ? '3px solid #007bff' : '1px solid #e0e0e0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                cursor: workoutsOnDay.length > 0 ? 'pointer' : 'default',
                opacity: workoutsOnDay.length === 0 ? 0.6 : 1,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseOver={(e) => {
                if (workoutsOnDay.length > 0) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }
              }}
              onMouseOut={(e) => {
                if (workoutsOnDay.length > 0) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }
              }}
            >
              {/* Day Header */}
              <div style={{
                textAlign: 'center',
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid #f0f0f0'
              }}>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#666',
                  marginBottom: '0.25rem'
                }}>
                  {dayNames[index]}
                </div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: isToday ? '#007bff' : '#333'
                }}>
                  {day.getDate()}
                </div>
              </div>
              
              {/* Workouts for this day */}
              {workoutsOnDay.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  color: '#999',
                  fontStyle: 'italic',
                  marginTop: '2rem'
                }}>
                  No workouts scheduled
                </div>
              ) : (
                workoutsOnDay.map((workoutData) => (
                  <div style={{
                    marginBottom: '1rem',
                    padding: '0.75rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef'
                  }}>
                    {workoutData.block.exercises && workoutData.block.exercises.map((ex, exIdx) => (
                      <div style={{ marginBottom: '0.5rem' }}> 
                          {ex.exercise?.name || 'Unnamed Exercise'}
                          <div style={{ 
                            color: '#6c757d', 
                            fontSize: '0.7rem', 
                            marginLeft: '0.5rem',
                            marginBottom: '0.25rem'
                          }}>
                            {ex.sets} sets × {ex.reps}
                          </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
      {selectedDay && (
        <WorkoutDayModal
          isOpen={!!selectedDay}
          onClose={() => setSelectedDay(null)}
          date={selectedDay.date}
          workouts={selectedDay.workouts}
          onExerciseClick={setSelectedExercise}
          isClient={role === 'user'}
        />
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
}