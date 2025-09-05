import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import RecipeCard from '../admin/recipe/RecipeCard'; // Import your RecipeCard component
import RecipeModal from '../admin/recipe/RecipeModal'; // Import your RecipeModal component
import { Doughnut } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';
import percentChangeImage from '../../assets/percentChange.png'

import '../../css/App.css';


import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, PointElement, LineElement, Title
} from 'chart.js';
import InputLogModal from './InputLogModal.js'
import ExerciseModal from '../admin/exercise/ExerciseModal';
import WorkoutDayModal from '../admin/WorkoutDayModal';
import WorkoutLogModal from './WorkoutLogModal.js';

// Register ChartJS components
ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, PointElement, LineElement, Title
);

export default function UserDashboard() {
  const { token } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [updates, setUpdates] = useState([]);

  const [nutritionPlans, setNutritionPlans] = useState([]);
  const [userData, setUserData] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [currentRecipeIndexes, setCurrentRecipeIndexes] = useState({});
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [selectedProgressPhoto, setSelectedProgressPhoto] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState(null);
  const [isWorkoutLogModalOpen, setIsWorkoutLogModalOpen] = useState(false);


  const categories = useMemo(() => ['breakfast', 'lunch', 'dinner', 'snack'], []);
  const days = useMemo(() => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], []);

  // Get current day of the week
  const getCurrentDay = () => {
    const today = new Date();
    const dayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    // Convert to our format (Monday = 0)
    const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
    return days[adjustedIndex];
  };

  const currentDay = getCurrentDay();
  const activeMealPlan = nutritionPlans.length > 0 ? nutritionPlans[0] : null;

  // Initialize recipe indexes when meal plan loads
  useEffect(() => {
    if (activeMealPlan && activeMealPlan.week && Object.keys(currentRecipeIndexes).length === 0) {
      const initialIndexes = {};
      categories.forEach(category => {
        const key = `${currentDay}-${category}`;
        const savedIndex = activeMealPlan.currentRecipeIndexes?.[key] || 0;
        const recipes = activeMealPlan.week[currentDay]?.[category] || [];

        initialIndexes[key] = Math.min(savedIndex, Math.max(0, recipes.length - 1));
      });
      setCurrentRecipeIndexes(initialIndexes);
    }
  }, [activeMealPlan, currentDay, categories, currentRecipeIndexes]);

  // Get current recipe for a specific meal
  const getCurrentRecipe = useCallback((day, category) => {
    const key = `${day}-${category}`;
    const recipes = activeMealPlan?.week?.[day]?.[category] || [];
    const currentIndex = currentRecipeIndexes[key] || 0;
    return recipes[currentIndex];
  }, [activeMealPlan, currentRecipeIndexes]);

  
  const saveCurrentRecipeIndex = async (day, category, index) => {
    try {
        await fetch(`http://localhost:9000/mealplans/${activeMealPlan._id}/set-current-recipe`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                day,
                category,
                recipeIndex: index
            }),
        });
    } catch (error) {
        console.error('Failed to save current recipe index:', error);
    }
};


  // Function to cycle to next recipe
  const cycleToNextRecipe = (day, category) => {
    const key = `${day}-${category}`;
    const recipes = activeMealPlan.week[day]?.[category] || [];
    
    if (recipes.length > 1) {
        const newIndex = (currentRecipeIndexes[key] + 1) % recipes.length;
        setCurrentRecipeIndexes(prev => ({
            ...prev,
            [key]: newIndex
        }));
        saveCurrentRecipeIndex(day, category, newIndex);
    }
};

  // Function to cycle to previous recipe
  const cycleToPrevRecipe = (day, category) => {
    const key = `${day}-${category}`;
    const recipes = activeMealPlan.week[day]?.[category] || [];
    
    if (recipes.length > 1) {
        const newIndex = currentRecipeIndexes[key] === 0 ? recipes.length - 1 : currentRecipeIndexes[key] - 1;
        setCurrentRecipeIndexes(prev => ({
            ...prev,
            [key]: newIndex
        }));
        saveCurrentRecipeIndex(day, category, newIndex);
    }
};

  // Calculate daily nutrition totals
  const dailyTotals = useMemo(() => {
    if (!activeMealPlan || !activeMealPlan.week || !currentRecipeIndexes) {
      return { calories: 0, protein: 0, carbs: 0, fats: 0 };
    }
    
    let dailyTotal = { calories: 0, protein: 0, carbs: 0, fats: 0 };

    categories.forEach(category => {
      const currentRecipe = getCurrentRecipe(currentDay, category);
      
      if (currentRecipe && Object.keys(currentRecipe).length > 0) {
        dailyTotal.calories += Number(currentRecipe.calories) || 0;
        dailyTotal.protein += Number(currentRecipe.protein) || 0;
        dailyTotal.carbs += Number(currentRecipe.carbs) || 0;
        dailyTotal.fats += Number(currentRecipe.fats) || 0;
      }
    });

    return {
      calories: Math.round(dailyTotal.calories),
      protein: Math.round(dailyTotal.protein),
      carbs: Math.round(dailyTotal.carbs),
      fats: Math.round(dailyTotal.fats),
    };
  }, [activeMealPlan, currentDay, categories, currentRecipeIndexes, getCurrentRecipe]);

  const getMetricInfo = (key) => {
    const entries = userData?.[key] || [];
    if (entries.length === 0) return { current: null, previous: null, percentChange: null, entries: [] };
   
    const current = entries[entries.length - 1];
    
    const previous = entries.length > 1 ? entries[entries.length - 2] : null;
    const percentChange = previous ? (((current.value - previous.value) / previous.value) * 100).toFixed(1) : null;
    return { current, previous, percentChange, entries };
  };

  const renderMetricCard = (label, key) => {
    const { current, previous, percentChange, entries } = getMetricInfo(key);

    // Determine unit and conversion
    let displayCurrent = current?.value;
    let displayPrevious = previous?.value;
    let unit = '';

    switch (key) {
      case 'weight':
        displayCurrent = current ? (current?.value * 2.20462).toFixed(1) : null; // kg → lbs
        displayPrevious = previous ? (previous.value * 2.20462).toFixed(1) : null;
        unit = 'lbs';
        break;
      case 'mCalories':
        unit = 'cals';
        break;
      case 'sleep':
        unit = 'hrs';
        break;
      default:
        unit = '';
    }

    return (
      <div style={metricCardStyle}>
        {current ? (
          <>
            <div style={{display: 'flex', justifyItems: 'center', alignItems: 'center', gap: '1rem'}}>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{label}</h3>
            
              <span>{displayCurrent} {unit}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              
              {percentChange !== null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <img 
                    src={percentChangeImage}
                    alt="Change" 
                    style={{ width: '20px', height: '20px' }}
                  />
                  <span style={{ fontSize: '12px' }}>{percentChange}%</span>
                </div>
              )}
              {previous && (
                <span style={{ fontSize: '12px', color: '#666' }}>
                  Previous: {displayPrevious} {unit}
                </span>
              )}
            </div>
            {entries.length > 1 ? (
              <div style={{ height: '100px' }}>
                <Line
                  data={{
                    labels: entries.map(e => new Date(e.date).toLocaleDateString()),
                    datasets: [{
                      label: label,
                      data: entries.map(e => {
                        if (key === 'weight') return (e.value * 2.20462).toFixed(1);
                        return e.value;
                      }),
                      borderColor: '#4285f4',
                      fill: false,
                    }]
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { ticks: { font: { size: 10 } } },
                      y: { beginAtZero: false }
                    }
                  }}
                />
              </div>
            ) : (
              <p style={{ fontStyle: 'italic', color: '#666' }}>
                Input more logs to show trends
              </p>
            )}
          </>
        ) : (
          <>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{label}</h3>
            <p style={{ color: '#666', fontStyle: 'italic' }}>No data available</p>
          </>
        )}
      </div>
    );
  };

  const getTodaysWorkouts = () => {
    if (!workouts || workouts.length === 0) return [];
    
    const today = new Date();
    const todaysWorkouts = [];
    
    workouts.forEach(workout => {
      if (workout.blocks) {
        workout.blocks.forEach(block => {
          const blockDate = new Date(block.scheduledDate);
          if (
            blockDate.getDate() === today.getDate() &&
            blockDate.getMonth() === today.getMonth() &&
            blockDate.getFullYear() === today.getFullYear()
          ) {
            todaysWorkouts.push({
              ...workout,
              block: block
            });
          }
        });
      }
    });
    
    return todaysWorkouts;
  };

  const handleSaveMetrics = async ({ weight, sleep }) => {
    // Example: Send POST request to your backend
    try {
      const body = {};
      if (weight !== null) body.weight = weight / 2.20462; // convert lbs → kg if needed
      if (sleep !== null) body.sleep = sleep;

      await fetch('http://localhost:9000/users/add-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      // Refresh user data
      const userRes = await fetch('http://localhost:9000/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const myData = await userRes.json();
      setUserData(myData);

      await fetchUpdates();

    } catch (err) {
      console.error(err);
    }
  };

  const handleNewProgressPhoto = async (field, file) => {
    const body = new FormData();
    body.append(field, file);

    const res = await fetch(`http://localhost:9000/users/${userData._id}/progress-picture`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });

  if (!res.ok) throw new Error("Update failed");

  const updated = await res.json();
  setUserData(updated);
  await fetchUpdates();
};

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch('http://localhost:9000/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const myData = await userRes.json();
        setUserData(myData);
        
        const workoutRes = await fetch('http://localhost:9000/workouts/my', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const workoutData = await workoutRes.json();
        setWorkouts(workoutData);
        
        const updateRes = await fetch('http://localhost:9000/updates/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const updateData = await updateRes.json();
        setUpdates(updateData);

        const nutritionRes = await fetch('http://localhost:9000/mealplans/my?populate=week', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const nutritionData = await nutritionRes.json();
        setNutritionPlans(nutritionData);
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };

    fetchData();
  }, [token]);

  const fetchUpdates = async () => {
    try {
      const updateRes = await fetch('http://localhost:9000/updates/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updateData = await updateRes.json();
      setUpdates(updateData);
    } catch (err) {
      console.error('Failed to fetch updates', err);
    }
  };

  const handleSaveWorkoutLog = async (logData) => {
    try {
      const response = await fetch('http://localhost:9000/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(logData),
      });

      if (!response.ok) {
        throw new Error('Failed to save workout log');
      }

      const result = await response.json();
      console.log('Workout log saved:', result);
      
      // Refresh updates or any other data if needed
      await fetchUpdates();
      
    } catch (error) {
      console.error('Error saving workout log:', error);
      throw error; // Re-throw so the modal can handle it
    }
  };


  // Handle modal overflow
  useEffect(() => {
    if (selectedRecipe || isProgressModalOpen || isInputModalOpen || isWorkoutLogModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedRecipe, isProgressModalOpen, isInputModalOpen, isWorkoutLogModalOpen]);

  console.log(workouts);
  
  return (
    <div style={containerStyle}>
      <div style={{display: 'flex'}}>
        <div>
          <div style={cardStyle}>
            {activeMealPlan ? (
              <>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
                    <span style={cardTitle}>Today's Meal Plan - {currentDay.charAt(0).toUpperCase() + currentDay.slice(1)}</span>
                    <span>{dailyTotals.calories} cal</span>
                    <span>•</span>
                    <span>P {dailyTotals.protein}g</span>
                    <span>C {dailyTotals.carbs}g</span>
                    <span>F {dailyTotals.fats}g</span>
                  </div>
                  <Link 
                      to={`/mealplans/${activeMealPlan.slug}`}
                      style={{
                        color: '#4285f4',
                        textDecoration: 'none',
                        fontWeight: '500',
                        fontSize: '14px'
                      }}
                    >
                      View Full Meal Plan →
                    </Link>
                  </div>
                <hr />


                {/* Today's recipes */}
                <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap',
                    gap: '15px'
                  }}>
                  {categories.map(category => {
                    const recipes = activeMealPlan.week[currentDay]?.[category] || [];
                    const currentRecipe = getCurrentRecipe(currentDay, category);
                    const currentIndex = currentRecipeIndexes[`${currentDay}-${category}`] || 0;
                    
                    if (recipes.length === 0) return null;
                    
                    return (
                      <div key={`${currentDay}-${category}`} style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center',
      
                      }}>
                        <h3 style={{ 
                          marginBottom: '5px', 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '12px'
                        }}>
                          <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                          
                          {/* Mini nutrition chart */}
                          <div style={{ width: '15px', height: '15px' }}>
                            <Doughnut
                              data={{
                                labels: ['Protein', 'Carbs', 'Fat'],
                                datasets: [{
                                  data: (() => {
                                    if (!currentRecipe) return [0, 0, 0];
                                    
                                    const protein = currentRecipe.protein || 0;
                                    const carbs = currentRecipe.carbs || 0;
                                    const fats = currentRecipe.fats || 0;
                                    
                                    return [
                                      protein * 4,  // Protein calories
                                      carbs * 4,    // Carb calories
                                      fats * 9      // Fat calories
                                    ];
                                  })(),
                                  backgroundColor: ['#4285F4', '#0F9D58', '#FBBC05'],
                                  borderWidth: 0
                                }]
                              }}
                              options={{
                                cutout: '60%',
                                plugins: {
                                  legend: { display: false },
                                  tooltip: {
                                    callbacks: {
                                      label: function(context) {
                                        const label = context.label || '';
                                        const value = context.raw || 0;
                                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                        const percentage = Math.round((value / total) * 100);
                                        return `${label}: ${percentage}%`;
                                      }
                                    }
                                  }
                                }
                              }}
                            />
                          </div>
                          
                          {/* Nutrition info */}
                          <div style={{ display: 'flex', gap: '8px', fontSize: '10px', color: '#666' }}>
                            {currentRecipe && (
                              <>
                                <span><strong>Cal:</strong> {currentRecipe.calories || 0}</span>
                                <span><strong>P:</strong> {currentRecipe.protein || 0}g</span>
                                <span><strong>C:</strong> {currentRecipe.carbs || 0}g</span>
                                <span><strong>F:</strong> {currentRecipe.fats || 0}g</span>
                              </>
                            )}
                          </div>
                        </h3>
                        
                        {/* Recipe card */}
                        {currentRecipe && (
                          <RecipeCard
                            recipe={currentRecipe}
                            onCardClick={setSelectedRecipe}
                            showDeleteButton={false}
                            currentIndex={currentIndex}
                            recipes={recipes}
                            day={currentDay}
                            category={category}
                            onSwitch={cycleToNextRecipe}
                            onSwitchPrev={cycleToPrevRecipe}
                            scale={0.7}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                
                
              </>
            ) : (
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                No meal plan assigned. Contact your trainer to get started!
              </p>
            )}
          </div>

          {/* Recipe Modal */}
          {selectedRecipe && (
            <RecipeModal
              recipe={selectedRecipe}
              isOpen={!!selectedRecipe}
              onClose={() => setSelectedRecipe(null)}
            />
          )}
          <div style={{...cardStyle, width: 'auto'}}>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <span style={cardTitle}>Body Metrics</span>
              <label htmlFor="add-metrics" style={{
                backgroundColor: '#0F9D58',
                color: 'white',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '18px'
              }}>
                +
                <input
                  id="add-metrics"
                  onClick={(e) => setIsInputModalOpen(true)}
                  
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            <hr></hr>
            <div style={metricsHorizontalGrid}>
              {renderMetricCard('Weight', 'weight')}
              {renderMetricCard('Sleep', 'sleep')}
              {renderMetricCard('BMI', 'bmi')}
              {renderMetricCard('Calorie Maintenance', 'mCalories')}
            </div>
          </div>
            <InputLogModal
              isOpen={isInputModalOpen}
              onClose={() => setIsInputModalOpen(false)}
              onSave={handleSaveMetrics}
            />
            
          </div>
          <div>
            <div style={{height: 'auto'}}>
              <div style={{...cardStyle, height: '5.375rem', width: 'auto'}}>
                <span style={cardTitle}>Goals</span>
                <hr></hr>
                <h4 style={{marginBottom: '0px'}}>General Goal:</h4>
                
                {(userData?.fitnessGoals || []).map((goal, index) => (
                  <span key={index}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{goal}</span>
                ))}
                
              </div >
              <div style={{...cardStyle, height: 'auto', minHeight: '5rem'}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '5rem' }}>
                  <span style={cardTitle}>Progress Photos</span>
                  <label htmlFor="progress-pic-input" style={{
                    backgroundColor: '#0F9D58',
                    color: 'white',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}>
                    +
                    <input
                      id="progress-pic-input"
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={(e) => handleNewProgressPhoto('progressPicture', e.target.files[0])}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                
                <hr />
                
                {userData.progressPictures && userData.progressPictures.length > 0 ? (
                  <>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                      {/* First photo */}
                      {userData.progressPictures.length > 0 && (() => {
                        const firstPic = userData.progressPictures[0];
                        const picData = typeof firstPic === 'string' ? { url: firstPic, date: new Date() } : firstPic;
                        return (
                          <div style={{ textAlign: 'center' }}>
                            <img
                              src={`http://localhost:9000${picData.url || firstPic}`}
                              alt="First Progress"
                              style={{ 
                                width: '110px', 
                                height: '110px', 
                                objectFit: 'cover', 
                                borderRadius: '8px',
                                cursor: 'pointer'
                              }}
                              onClick={() => {
                                setSelectedProgressPhoto({ ...picData, url: picData.url || firstPic, index: 0 });
                                setIsProgressModalOpen(true);
                              }}
                            />
                            <p style={{ fontSize: '10px', margin: '0 0 0 0', color: '#666' }}>
                              First: {new Date(picData.date || picData.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        );
                      })()}
                      
                      {/* Most recent photo (if different from first) */}
                      {userData.progressPictures.length > 1 && (() => {
                        const lastPic = userData.progressPictures[userData.progressPictures.length - 1];
                        const picData = typeof lastPic === 'string' ? { url: lastPic, date: new Date() } : lastPic;
                        const lastIndex = userData.progressPictures.length - 1;
                        return (
                          <div style={{ textAlign: 'center' }}>
                            <img
                              src={`http://localhost:9000${picData.url || lastPic}`}
                              alt="Latest Progress"
                              style={{ 
                                width: '110px', 
                                height: '110px', 
                                objectFit: 'cover', 
                                borderRadius: '8px',
                                cursor: 'pointer'
                              }}
                              onClick={() => {
                                setSelectedProgressPhoto({ ...picData, url: picData.url || lastPic, index: lastIndex });
                                setIsProgressModalOpen(true);
                              }}
                            />
                            <p style={{ fontSize: '10px', margin: '0 0 0 0', color: '#666' }}>
                              Latest: {new Date(picData.date || picData.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                    
                    {userData.progressPictures.length > 4 && (
                      <button
                        onClick={() => setIsProgressModalOpen(true)}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          border: '1px solid #ccc',
                          background: '#fff',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        View All ({userData.progressPictures.length})
                      </button>
                    )}
                  </>
                ) : (
                  <p>Add your first Progress Photo!</p>
                )}
              </div>
              {isProgressModalOpen && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000
                }}>
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    maxWidth: '800px',
                    maxHeight: '600px',
                    width: '90%',
                    display: 'flex',
                    gap: '1.5rem'
                  }}>
                    {/* Left side - Photo list */}
                    <div style={{
                      flex: '1',
                      maxHeight: '500px',
                      overflowY: 'auto'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3>Progress Photos</h3>
                        <button
                          onClick={() => setIsProgressModalOpen(false)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer'
                          }}
                        >
                          ×
                        </button>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {userData.progressPictures.map((pic, index) => {
                          const picData = typeof pic === 'string' ? { url: pic, date: new Date() } : pic;
                          return (
                            <div
                              key={index}
                              onClick={() => setSelectedProgressPhoto({ ...picData, url: picData.url || pic, index })}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                backgroundColor: selectedProgressPhoto?.index === index ? '#f0f0f0' : 'transparent',
                                border: selectedProgressPhoto?.index === index ? '2px solid #4285f4' : '1px solid #eee'
                              }}
                            >
                              <img
                                src={`http://localhost:9000${picData.url || pic}`}
                                alt={`Progress ${index + 1}`}
                                style={{
                                  width: '60px',
                                  height: '60px',
                                  objectFit: 'cover',
                                  borderRadius: '6px'
                                }}
                              />
                              <div>
                                <p style={{ margin: 0, fontWeight: '500' }}>Photo {index + 1}</p>
                                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                                  {new Date(picData.date || picData.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Right side - Large photo */}
                    <div style={{
                      flex: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f9f9f9',
                      borderRadius: '8px',
                      minHeight: '400px'
                    }}>
                      {selectedProgressPhoto ? (
                        <div style={{ textAlign: 'center' }}>
                          <img
                            src={`http://localhost:9000${selectedProgressPhoto.url}`}
                            alt={`Progress ${selectedProgressPhoto.index + 1}`}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '350px',
                              objectFit: 'contain',
                              borderRadius: '8px'
                            }}
                          />
                          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                            {new Date(selectedProgressPhoto.date || selectedProgressPhoto.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <p style={{ color: '#666' }}>Select a photo to view</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
              <div style={{...cardStyle, height: '15.8125rem', width: 'auto'}}>
                <span style={cardTitle}>Updates</span>
                <hr></hr>
                <div style={{height: '200px', overflowY: 'scroll'}}>
                  {updates.length > 0 ? (
                    updates.map((update, index) => (
                      <div key={update._id || index} style={{ marginBottom: '0.5rem' }}>
                        <span>
                          <strong>{update.userId?.firstName}</strong> {update.message}
                        </span>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {new Date(update.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontStyle: 'italic', color: '#666' }}>No updates yet</p>
                  )}
                </div>      
              </div>
          </div>
          <div style={{...cardStyle, height: '43rem', width: '20rem'}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={cardTitle}>Today's Workout</span>
              {getTodaysWorkouts().length > 0 && (
                <Link 
                  to={`/workouts/${getTodaysWorkouts()[0]._id}`}
                  style={{
                    color: '#4285f4',
                    textDecoration: 'none',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}
                >
                  View Full Calendar →
                </Link>
              )}
            </div>
            <hr />
            
            {getTodaysWorkouts().length === 0 ? (
              <div style={{
                textAlign: 'center',
                color: '#999',
                fontStyle: 'italic',
                marginTop: '2rem'
              }}>
                No workouts scheduled for today
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem',
                maxHeight: '35rem',
                overflowY: 'auto'
              }}>
                {getTodaysWorkouts().map((workoutData, workoutIdx) => (
                  <div 
                    key={workoutIdx}
                    style={{
                      height: '75vh',
                      backgroundColor: 'white',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '3px solid #007bff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      cursor: getTodaysWorkouts().length > 0 ? 'pointer' : 'default',
                      opacity: getTodaysWorkouts().length === 0 ? 0.6 : 1,
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onClick={() => setSelectedWorkoutDay({
                      date: new Date(),
                      workouts: [workoutData]
                    })}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    }}
                  >
                    <h4 style={{ margin: '0 0 1rem 0', color: '#333', textAlign: 'center', }}>
                      {workoutData.title || 'Workout'}
                    </h4>
                    
                    {workoutData.block.exercises && workoutData.block.exercises.map((ex, exIdx) => (
                      <div 
                        key={exIdx}
                        style={{ 
                          marginBottom: '1rem',
                          padding: '0.75rem',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '6px',
                          border: '1px solid #e9ecef'
                        }}
                      > 
                        <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                          {ex.exercise?.name || 'Unnamed Exercise'}
                        </div>
                        <div style={{ 
                          color: '#6c757d', 
                          fontSize: '0.7rem', 
                          marginLeft: '0.5rem',
                          marginBottom: '0.25rem'
                        }}>
                          {ex.sets} sets × {ex.reps} reps
                          {ex.weight && <span> @ {ex.weight}lbs</span>}
                          {ex.restTime && <span> | Rest: {ex.restTime}s</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
            <button 
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#FF8C00',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '0.5rem',
                transition: 'background-color 0.2s ease'
              }}
              onClick={(e) => setIsWorkoutLogModalOpen(true)}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#FF7F00';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#FF8C00';
              }}
            >
              Log Workout
            </button>

            <WorkoutLogModal
              isOpen={isWorkoutLogModalOpen}
              onClose={() => setIsWorkoutLogModalOpen(false)}
              onSubmit={handleSaveWorkoutLog}
              workoutDataInput={getTodaysWorkouts()[0]}
              scheduledDate={new Date().toISOString().split('T')[0]}
            />
            
          </div>
          {selectedWorkoutDay && (
            <WorkoutDayModal
              isOpen={!!selectedWorkoutDay}
              onClose={() => setSelectedWorkoutDay(null)}
              date={selectedWorkoutDay.date}
              workouts={selectedWorkoutDay.workouts}
              onExerciseClick={setSelectedExercise}
              isClient={true}
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
        
    </div>
    

  );
}

// Styles
const containerStyle = {
  padding: '1.5rem',
  margin: 'auto',
  position: 'fixed'
  
};

const cardStyle = {
  padding: '1.5rem',
  border: '1px solid rgb(204, 175, 175)',
  borderRadius: '14px',
  background: 'rgb(214, 206, 206)',
  width: 'fit-content',
  marginBottom: '.75rem',
  marginRight: '.75rem'
};

const cardTitle = {
  fontWeight: '600',
  fontSize: '21px',
};

const metricsHorizontalGrid = {
  display: 'flex',
  gap: '20px',
  overflowX: 'auto',
  paddingBottom: '10px'
};

const metricCardStyle = {
  border: '1px solid #ccc',
  borderRadius: '12px',
  padding: '0.5rem',
  background: '#fff',
  minWidth: '160px',
  flex: '0 0 auto'
};