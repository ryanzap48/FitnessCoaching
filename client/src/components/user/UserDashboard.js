import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import RecipeCard from '../admin/recipe/RecipeCard'; // Import your RecipeCard component
import RecipeModal from '../admin/recipe/RecipeModal'; // Import your RecipeModal component
import { Doughnut } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, PointElement, LineElement, Title
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, PointElement, LineElement, Title
);

export default function UserDashboard() {
  const { token } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [nutritionPlans, setNutritionPlans] = useState([]);
  const [userData, setUserData] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [currentRecipeIndexes, setCurrentRecipeIndexes] = useState({});

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
    const entries = userData?.metrics?.[key] || [];
    if (entries.length === 0) return { current: null, previous: null, percentChange: null, entries: [] };

    const current = entries[entries.length - 1];
    const previous = entries.length > 1 ? entries[entries.length - 2] : null;
    const percentChange = previous ? (((current.value - previous.value) / previous.value) * 100).toFixed(1) : null;
    return { current, previous, percentChange, entries };
  };

  const renderMetricCard = (label, key) => {
    const { current, previous, percentChange, entries } = getMetricInfo(key);

    return (
      <div style={metricCardStyle}>
        <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{label}</h3>
        {current ? (
          <>
            <p><strong>Current:</strong> {current.value}</p>
            {percentChange !== null && <p><strong>Change:</strong> {percentChange}%</p>}
            {previous && <p><strong>Previous:</strong> {previous.value}</p>}

            <div style={{ height: '150px' }}>
              <Line
                data={{
                  labels: entries.map(e => new Date(e.date).toLocaleDateString()),
                  datasets: [{
                    label: label,
                    data: entries.map(e => e.value),
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
          </>
        ) : (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No data available</p>
        )}
      </div>
    );
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

  // Handle modal overflow
  useEffect(() => {
    if (selectedRecipe) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedRecipe]);

  return (
    <div style={containerStyle}>
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
      <div style={cardStyle}>
        <span style={cardTitle}>Body Metrics</span>
        <hr></hr>
        <div style={metricsGrid}>
          {renderMetricCard('Weight', 'weight')}
          {renderMetricCard('Sleep', 'sleep')}
          {renderMetricCard('BMI', 'bmi')}
          {renderMetricCard('Calorie Maintenance', 'calories')}
        </div>
      </div>
    </div>

  );
}

// Styles
const containerStyle = {
  padding: '1.5rem',
  margin: 'auto',
};

const cardStyle = {
  padding: '1.5rem',
  border: '1px solid rgb(204, 175, 175)',
  borderRadius: '14px',
  background: 'rgb(214, 206, 206)',
  width: 'fit-content'
};

const cardTitle = {
  fontWeight: '600',
  fontSize: '21px',
};

const metricsGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gridTemplateRows: '1fr 1fr',
  gap: '20px',
};

const metricCardStyle = {
  border: '1px solid #ccc',
  borderRadius: '12px',
  padding: '1rem',
  background: '#fff',
  minWidth: '200px'
};