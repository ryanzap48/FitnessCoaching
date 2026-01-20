import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import RecipeCard from './recipe/RecipeCard';
import RecipeModal from './recipe/RecipeModal';
import EditMealPlanModal from './mealPlan/EditMealPlanModal';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import weeklyNutrition from '../../assets/weekly-nutrition.png'
import { Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const MealPlanDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { token, role } = useAuth();
    const [mealPlan, setMealPlan] = useState(null);
    const [error, setError] = useState(null);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [editModeMealPlan, setEditModeMealPlan] = useState(null);
    const [assignEmail, setAssignEmail] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    

     // Edit mode states
    const [editingDays, setEditingDays] = useState({}); // Track which days are in edit mode
    const [addRecipeInputs, setAddRecipeInputs] = useState({}); // Track input values for each meal
    const [validatedRecipes, setValidatedRecipes] = useState({}); // Store validated recipe data
    const [validationTimers, setValidationTimers] = useState({}); // Debounce timers
    

    

    // State to track current recipe index for each meal category
    const [currentRecipeIndexes, setCurrentRecipeIndexes] = useState({});

    const days = useMemo(() => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], []);
    const categories = useMemo(() => ['breakfast', 'lunch', 'dinner', 'snack'], []);

    // Initialize recipe indexes when meal plan loads
    useEffect(() => {
        if (mealPlan && mealPlan.week && Object.keys(currentRecipeIndexes).length === 0) {
            const initialIndexes = {};
            days.forEach(day => {
                categories.forEach(category => {
                    const key = `${day}-${category}`;
                    // Use saved index if available, otherwise default to 0
                    const savedIndex = mealPlan.currentRecipeIndexes?.[key] || 0;
                    const recipes = mealPlan.week[day]?.[category] || [];
                    // Ensure index is within bounds
                    initialIndexes[key] = Math.min(savedIndex, Math.max(0, recipes.length - 1));
                });
            });
            setCurrentRecipeIndexes(initialIndexes);
        }
    }, [mealPlan, days, categories, currentRecipeIndexes]);

        // Debounced validation function
    const debouncedValidate = useCallback((day, category, recipeName) => {
    const key = `${day}-${category}`;
    
    // Clear existing timer
    if (validationTimers[key]) {
        clearTimeout(validationTimers[key]);
    }
    
    const timer = setTimeout(async () => {
        if (recipeName.trim()) {
            // Check for duplicates first
            const existingRecipes = mealPlan.week[day]?.[category] || [];
            const isDuplicate = existingRecipes.some(recipe => 
                recipe.name.toLowerCase().trim() === recipeName.toLowerCase().trim()
            );
            
            if (isDuplicate) {
                setValidatedRecipes(prev => ({
                    ...prev,
                    [key]: null
                }));
                setValidationErrors(prev => ({
                    ...prev,
                    [key]: `"${recipeName}" is already in this meal`
                }));
                return;
            }
            
            try {
                const response = await fetch('http://localhost:9000/recipes/validate-names', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ names: [recipeName] }),
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const foundRecipe = data.foundRecipes[0];
                    
                    setValidatedRecipes(prev => ({
                        ...prev,
                        [key]: foundRecipe || null
                    }));
                    
                    // Set validation error if recipe not found
                    setValidationErrors(prev => ({
                        ...prev,
                        [key]: foundRecipe ? null : `"${recipeName}" not found`
                    }));
                } else {
                    setValidatedRecipes(prev => ({
                        ...prev,
                        [key]: null
                    }));
                    setValidationErrors(prev => ({
                        ...prev,
                        [key]: 'Error validating recipe'
                    }));
                }
            } catch (error) {
                console.error('Validation error:', error);
                setValidatedRecipes(prev => ({
                    ...prev,
                    [key]: null
                }));
                setValidationErrors(prev => ({
                    ...prev,
                    [key]: 'Error validating recipe'
                }));
            }
        } else {
            setValidatedRecipes(prev => ({
                ...prev,
                [key]: null
            }));
            setValidationErrors(prev => ({
                ...prev,
                [key]: null
            }));
        }
    }, 50); // 250ms debounce
    
    setValidationTimers(prev => ({
        ...prev,
        [key]: timer
    }));
}, [token, validationTimers, mealPlan]);


// Function to save current recipe selection to backend
const saveCurrentRecipeIndex = async (day, category, index) => {
    try {
        await fetch(`http://localhost:9000/mealplans/${mealPlan._id}/set-current-recipe`, {
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


// Handle input change for add recipe
const handleAddRecipeInputChange = (day, category, value) => {
    const key = `${day}-${category}`;
    setAddRecipeInputs(prev => ({
        ...prev,
        [key]: value
    }));
    
    debouncedValidate(day, category, value);
};
    const handleAddRecipe = async (day, category) => {
        const key = `${day}-${category}`;
        const recipeToAdd = validatedRecipes[key];
        
        const response = await fetch(`http://localhost:9000/mealplans/${mealPlan._id}/add-recipe`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                day,
                category,
                recipeId: recipeToAdd.id
            }),
        });
        
        if (response.ok) {
            const refreshResponse = await fetch(`http://localhost:9000/mealplans/${slug}?populate=week`);
            if (refreshResponse.ok) {
                const refreshedData = await refreshResponse.json();
                
                // Update meal plan
                setMealPlan(refreshedData);

                // Find the index of the newly added recipe by its ID
                const updatedRecipes = refreshedData.week[day]?.[category] || [];
                const newRecipeIndex = updatedRecipes.findIndex(recipe => recipe._id === recipeToAdd.id);
                
                if (newRecipeIndex !== -1) {
                    setCurrentRecipeIndexes(prev => ({
                        ...prev,
                        [key]: newRecipeIndex
                    }));
                }
            }
            
            // Clear the input states
            setAddRecipeInputs(prev => ({
                ...prev,
                [key]: ''
            }));
            setValidatedRecipes(prev => ({
                ...prev,
                [key]: null
            }));
            setValidationErrors(prev => ({
                ...prev,
                [key]: null
            }));
        }
    };

    const handleRemoveRecipe = async (day, category, recipeId) => {
        if (!window.confirm('Are you sure you want to remove this recipe?')) return;
        
        try {
            const response = await fetch(`http://localhost:9000/mealplans/${mealPlan._id}/remove-recipe`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    day,
                    category,
                    recipeId
                }),
            });
            
            if (response.ok) {
                const refreshResponse = await fetch(`http://localhost:9000/mealplans/${slug}?populate=week`);
                if (refreshResponse.ok) {
                    const refreshedData = await refreshResponse.json();
                    setMealPlan(refreshedData);
                }
                
                // Reset current recipe index if needed
                const key = `${day}-${category}`;
                const recipes = mealPlan.week[day]?.[category] || [];
                if (currentRecipeIndexes[key] >= recipes.length - 1) {
                    setCurrentRecipeIndexes(prev => ({
                        ...prev,
                        [key]: Math.max(0, recipes.length - 2)
                    }));
                }
            }
        } catch (error) {
            console.error('Remove recipe error:', error);
            alert('Failed to remove recipe');
        }
    };

    const toggleEditMode = (day) => {
        setEditingDays(prev => ({
            ...prev,
            [day]: !prev[day]
        }));
        
        // Clear any pending validations when exiting edit mode
        if (editingDays[day]) {
            categories.forEach(category => {
                const key = `${day}-${category}`;
                if (validationTimers[key]) {
                    clearTimeout(validationTimers[key]);
                }
                setAddRecipeInputs(prev => ({
                    ...prev,
                    [key]: ''
                }));
                setValidatedRecipes(prev => ({
                    ...prev,
                    [key]: null
                }));
                setValidationErrors(prev => ({
                    ...prev,
                    [key]: null
                }));
            });
        }
    };

    // Function to cycle to next recipe
    const cycleToNextRecipe = (day, category) => {
        const key = `${day}-${category}`;
        const recipes = mealPlan.week[day]?.[category] || [];
        
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
        const recipes = mealPlan.week[day]?.[category] || [];
        
        if (recipes.length > 1) {
            const newIndex = currentRecipeIndexes[key] === 0 ? recipes.length - 1 : currentRecipeIndexes[key] - 1;
            setCurrentRecipeIndexes(prev => ({
                ...prev,
                [key]: newIndex
            }));
            saveCurrentRecipeIndex(day, category, newIndex);
        }
    };

    // Get current recipe for a specific meal
    const getCurrentRecipe = useCallback((day, category) => {
        const key = `${day}-${category}`;
        const recipes = mealPlan?.week?.[day]?.[category] || [];
        const currentIndex = currentRecipeIndexes[key] || 0;
        return recipes[currentIndex];
    }, [mealPlan, currentRecipeIndexes]);

    // Get all recipes for nutrition calculation (still using averages)
    const getAllRecipesForMeal = (day, category) => {
        return mealPlan.week[day]?.[category] || [];
    };
    
    const dailyTotals = useMemo(() => {
        if (!mealPlan || !mealPlan.week || !currentRecipeIndexes) {
            console.log('No meal plan or week data available');
            return {};
        }
        
        const totals = {};

        const calculateDailyTotals = (day) => {
            let dailyTotal = { calories: 0, protein: 0, carbs: 0, fats: 0 };
            let recipeCount = 0;

            categories.forEach(category => {
                const currentRecipe = getCurrentRecipe(day, category);
                
                if (currentRecipe && Object.keys(currentRecipe).length > 0) {
                    // Use the currently selected recipe's nutrition values
                    dailyTotal.calories += Number(currentRecipe.calories) || 0;
                    dailyTotal.protein += Number(currentRecipe.protein) || 0;
                    dailyTotal.carbs += Number(currentRecipe.carbs) || 0;
                    dailyTotal.fats += Number(currentRecipe.fats) || 0;
                    recipeCount++;
                }
            });

            return recipeCount > 0 ? {
                calories: Math.round(dailyTotal.calories),
                protein: Math.round(dailyTotal.protein),
                carbs: Math.round(dailyTotal.carbs),
                fats: Math.round(dailyTotal.fats),
            } : { calories: 0, protein: 0, carbs: 0, fats: 0 };
        };

        days.forEach(day => {
            totals[day] = calculateDailyTotals(day);
        });

        return totals;
    }, [mealPlan, days, categories, currentRecipeIndexes, getCurrentRecipe]);

    const weeklyAverages = useMemo(() => {
        if (!dailyTotals) {
            console.log('No daily totals available');
            return null;
        }

        const calculateWeeklyAverage = () => {
            let weeklyTotal = { calories: 0, protein: 0, carbs: 0, fats: 0 };
            let validDays = 0;

            days.forEach(day => {
                const dailyTotal = dailyTotals[day];
                if (dailyTotal && (dailyTotal.calories > 0 || dailyTotal.protein > 0 || dailyTotal.carbs > 0 || dailyTotal.fats > 0)) {
                    weeklyTotal.calories += dailyTotal.calories;
                    weeklyTotal.protein += dailyTotal.protein;
                    weeklyTotal.carbs += dailyTotal.carbs;
                    weeklyTotal.fats += dailyTotal.fats;
                    validDays++;
                }
            });

            if (validDays === 0) return null;

            const averages = {
                calories: Math.round(weeklyTotal.calories / validDays),
                protein: Math.round(weeklyTotal.protein / validDays),
                carbs: Math.round(weeklyTotal.carbs / validDays),
                fats: Math.round(weeklyTotal.fats / validDays),
            };

            return averages;
        };

        return calculateWeeklyAverage();
    }, [dailyTotals, days]);
    
    useEffect(() => {
        const fetchMealPlan = async () => {
            try {
                const response = await fetch(`http://localhost:9000/mealplans/${slug}?populate=week`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setMealPlan(data);
            } catch (err) {
                console.error("Fetch error:", err);
                setError(err.message);
            }
        };
        fetchMealPlan();
    }, [slug]);

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

    const handleAssign = async (id, email) => {
        if (!email) return alert('Please enter a valid email.');

        try {
            const res = await fetch(`http://localhost:9000/mealplans/${id}/assign`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userEmail: email }),
            });

            if (res.ok) {
                // Instead of using the response, refetch the meal plan with populated data
                const refreshResponse = await fetch(`http://localhost:9000/mealplans/${slug}?populate=week`);
                if (refreshResponse.ok) {
                    const refreshedData = await refreshResponse.json();
                    setMealPlan(refreshedData);

                    if (editModeMealPlan && editModeMealPlan._id === id) {
                        setEditModeMealPlan(refreshedData);
                    }
                }
                setAssignEmail('');
                
            }
        } catch (err) {
            console.error("Assign error:", err);
            setError(err.message);
        }
    };

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            Object.values(validationTimers).forEach(timer => {
                if (timer) clearTimeout(timer);
            });
        };
    }, [validationTimers]);

    const handleUnassign = async (id, userEmail) => {
        if (!window.confirm(`Unassign ${userEmail}?`)) return;

        try {
            const res = await fetch(`http://localhost:9000/mealplans/${id}/unassign`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userEmail }),
            });

            if (res.ok) {
                // Instead of using the response, refetch the meal plan with populated data
                const refreshResponse = await fetch(`http://localhost:9000/mealplans/${slug}?populate=week`);
                if (refreshResponse.ok) {
                    const refreshedData = await refreshResponse.json();
                    setMealPlan(refreshedData);
                    if (editModeMealPlan && editModeMealPlan._id === id) {
                        setEditModeMealPlan(refreshedData);
                    }
                }
            }
        } catch (err) {
            console.error("Unassign error:", err);
            setError(err.message);
        }
    };

    const handleDeleteMealPlan = async () => {
        if (!window.confirm('Are you sure you want to delete this meal plan?')) return;

        try {
            const res = await fetch(`http://localhost:9000/mealplans/${mealPlan._id}`, {
                method: 'DELETE',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
            });

            if (res.ok) {
                navigate('/adminmealplans');
            } else {
                throw new Error('Failed to delete meal plan');
            }
        } catch (err) {
            console.error("Delete error:", err);
            setError(err.message);
        }
    };

    if (error) {
        return <div>Error loading meal plan: {error}</div>;
    }

    if (!mealPlan) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ padding: '1.5rem', margin: 'auto', }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0px' }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                    <h1>{mealPlan.name}  </h1>
                    <h4 style={{marginBottom: '0.56rem', fontSize: '15px'}}>{mealPlan.duration} Weeks</h4>
                </div>
                
                <div>
                    {role === 'admin' && (
                        <>
                            <button 
                                style={{ marginRight: '10px', padding: '8px 16px', borderRadius: '6px', border: '1px solid #888', backgroundColor: 'white', fontWeight: '600' }}
                                onClick={() => navigate('../adminmealplans')}
                            >
                                Back To Meal Plans
                            </button>
                    
                            <button 
                                style={{ marginRight: '10px', padding: '8px 16px', borderRadius: '6px', border: '1px solid #888', backgroundColor: 'white', fontWeight: '600' }}
                                onClick={() => setEditModeMealPlan(mealPlan)}
                            >
                                Assign Meal Plan
                            </button>
                            <button 
                                style={{ padding: '9px 17px', backgroundColor: '#ff4444', color: 'white', borderRadius: '6px', border: 'none', fontWeight: '600' }}
                                onClick={handleDeleteMealPlan}
                            >
                                Delete Plan
                            </button>
                        </>
                    )}
                </div>
            </div>
            <hr style={{ border: 'none', borderTop: '2px solid #ccc', width: '100%', marginTop: '0px' }} />

            <div style={{ display: 'flex', alignItems: 'center', padding: '0px 16px', marginBottom: '30px', marginTop: '10px', gap: '1.5rem', borderRadius: '6px', border: '1px solid #888', backgroundColor: 'rgb(0, 0, 0, .45)' }}>
                <img src={weeklyNutrition} alt="Weekly Nutrition"  style={{ width: '33px', height: '33px', marginBottom: '5px' }}></img>
                <p style={{ marginLeft: '-20px',}}>Weekly Nutrition Averages: </p>
                <span>{weeklyAverages?.calories}</span>
                <span style={{marginLeft: '-1.5rem', marginTop: '3px', fontSize: '14px'}}>cal</span> •
                <p>P {weeklyAverages?.protein}</p>
                <span style={{marginLeft: '-1.4rem', marginTop: '3px', fontSize: '14px'}}>g</span>
                <p>C {weeklyAverages?.carbs}</p>
                <span style={{marginLeft: '-1.4rem', marginTop: '3px', fontSize: '14px'}}>g</span>
                <p>F {weeklyAverages?.fats}</p>
                <span style={{marginLeft: '-1.4rem', marginTop: '3px', fontSize: '14px'}}>g</span>
            </div>

            <div>
                {days.map((day, index) => (
                    <div key={day}>
                        <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #eee', marginBottom: '0px'}}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <span>{day.charAt(0).toUpperCase() + day.slice(1)} </span>
                                <span style={{fontSize: '20px', marginLeft: '-18px'}}>(DAY {index + 1}) </span>
                                <span style={{marginTop: '5px', fontSize: '17px'}}>{dailyTotals[day]?.calories}</span>
                                <span style={{marginLeft: '-1.4rem', marginTop: '5px', fontSize: '14px'}} >cal</span> 
                                <span style={{fontSize: '15px', marginTop: '7px'}}>•</span>
                                <span style={{marginTop: '5px', fontSize: '17px'}}>P {dailyTotals[day]?.protein}</span>
                                <span style={{marginLeft: '-1.4rem', marginTop: '5px', fontSize: '13px'}}>g</span>
                                <span style={{marginTop: '5px', fontSize: '17px'}}>C {dailyTotals[day]?.carbs}</span>
                                <span style={{marginLeft: '-1.4rem', marginTop: '5px', fontSize: '13px'}}>g</span>
                                <span style={{marginTop: '5px', fontSize: '17px'}}>F {dailyTotals[day]?.fats}</span>
                                <span style={{marginLeft: '-1.4rem', marginTop: '5px', fontSize: '13px'}}>g</span>
                            </div>
                            
                            {/* Edit Button */}
                            {role === 'admin' && (
                                <button
                                    onClick={() => toggleEditMode(day)}
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        backgroundColor: editingDays[day] ? '#ff6b6b' : '#4285f4',
                                        color: 'white',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s ease'
                                    }}
                                >
                                    {editingDays[day] ? 'Done' : 'Edit'}
                                </button>
                            )}
                        </h2>
                                                    
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginTop: '15px', border: '3px dotted #ccc', borderRadius: '8px', padding: '5px 20px' }}>
                            {categories.map(category => (
                                mealPlan.week[day]?.[category]?.length > 0 && (
                                    <div key={`${day}-${category}`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                        <h3 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                {category.charAt(0).toUpperCase() + category.slice(1)}
                                                <div style={{ marginLeft: '13px', width: '25px', height: '25px' }}>
                                                    <Doughnut
                                                        data={{
                                                            labels: ['Protein', 'Carbs', 'Fat'],
                                                            datasets: [{
                                                                data: (() => {
                                                                    // Use the currently selected recipe's nutrition for this meal category
                                                                    const currentRecipe = getCurrentRecipe(day, category);
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
                                            
                                            <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: '#666', marginLeft:'12px' }}>
                                                {(() => {
                                                    // Use the currently selected recipe's nutrition for this meal category
                                                    const currentRecipe = getCurrentRecipe(day, category);
                                                    if (!currentRecipe) return <span>No recipe selected</span>;
                                                    
                                                    const calories = currentRecipe.calories || 0;
                                                    const protein = currentRecipe.protein || 0;
                                                    const carbs = currentRecipe.carbs || 0;
                                                    const fats = currentRecipe.fats || 0;
                                                    
                                                    return (
                                                        <>
                                                            <span><strong>Cal:</strong> {calories}</span>
                                                            <span><strong>P:</strong> {protein}g</span>
                                                            <span><strong>C:</strong> {carbs}g</span>
                                                            <span><strong>F:</strong> {fats}g</span>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                            </div>
                                        </h3>
                                        
                                        {/* Current recipe display with switch button */}
                                        <div style={{ position: 'relative', transform: 'scale(0.95)', transformOrigin: 'top center' }}> 
                                            {(() => {
                                                const recipes = getAllRecipesForMeal(day, category);
                                                const currentIndex = currentRecipeIndexes[`${day}-${category}`] || 0;
                                                const currentRecipe = getCurrentRecipe(day, category);
                                                
                                                return currentRecipe ? (
                                                    <>
                                                        <RecipeCard
                                                            recipe={currentRecipe}
                                                            onCardClick={setSelectedRecipe}
                                                            showDeleteButton={editingDays[day] && recipes.length > 1}
                                                            onDelete={() => handleRemoveRecipe(day, category, currentRecipe._id)}
                                                            currentIndex={currentIndex}
                                                            recipes={recipes}
                                                            day={day}
                                                            category={category}
                                                            onSwitch={cycleToNextRecipe}      // Next recipe function
                                                            onSwitchPrev={cycleToPrevRecipe}  // Previous recipe function
                                                            />
                                                    </>
                                                ) : null;
                                            })()}
                                        </div>

                                        {/* Add Recipe Input - Only show when in edit mode */}
                                        {editingDays[day] && (
                                            <div style={{
                                                width: '100%',
                                                maxWidth: '300px'
                                            }}>
                                                <div style={{
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '10px'
                                                }}>
                                                    {/* Recipe Preview Image */}
                                                    {validatedRecipes[`${day}-${category}`] && (
                                                        <div style={{
                                                            width: '33px',
                                                            height: '33px',
                                                            borderRadius: '4px',
                                                            overflow: 'hidden',
                                                            flexShrink: 0
                                                        }}>
                                                            <img 
                                                                src={validatedRecipes[`${day}-${category}`].imageUrl || '/default-recipe.png'} 
                                                                alt="Recipe preview"
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover'
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                    
                                                    {/* Input Field */}
                                                    <input
                                                        type="text"
                                                        placeholder="Enter recipe name..."
                                                        maxLength={40}
                                                        value={addRecipeInputs[`${day}-${category}`] || ''}
                                                        onChange={(e) => handleAddRecipeInputChange(day, category, e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && validatedRecipes[`${day}-${category}`]) {
                                                                handleAddRecipe(day, category);
                                                            }
                                                        }}
                                                        style={{
                                                            flex: 1,
                                                            padding: '8px 12px',
                                                            fontSize: '14px',
                                                            border: '1px solid #ccc',
                                                            borderRadius: '4px',
                                                            outline: 'none',
                                                            borderColor: validatedRecipes[`${day}-${category}`] ? '#4285f4' : 
                                                                    validationErrors[`${day}-${category}`] ? '#ff4444' : '#ccc'
                                                        }}
                                                    />
                                                    
                                                    {/* Add Button */}
                                                    <button
                                                        onClick={() => handleAddRecipe(day, category)}
                                                        disabled={!validatedRecipes[`${day}-${category}`]}
                                                        style={{
                                                            padding: '6px 12px',
                                                            fontSize: '14px',
                                                            fontWeight: '600',
                                                            border: '1px solid #ccc',
                                                            borderRadius: '4px',
                                                            backgroundColor: validatedRecipes[`${day}-${category}`] ? 'rgb(23, 165, 70)' : '#ccc',
                                                            color: 'white',
                                                            cursor: validatedRecipes[`${day}-${category}`] ? 'pointer' : 'not-allowed',
                                                            transition: 'background-color 0.2s ease'
                                                        }}
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                                
                                                {/* Validation Error Message */}
                                                <div style={{ minHeight: '1.25rem', marginTop: '5px' }}>
                                                    {validationErrors[`${day}-${category}`] && (
                                                        <small style={{ color: '#ff4444', fontSize: '12px' }}>
                                                            {validationErrors[`${day}-${category}`]}
                                                        </small>
                                                    )}
                                                </div>
                                            </div>
                                        )}



                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {selectedRecipe && (
                <RecipeModal
                    recipe={selectedRecipe}
                    isOpen={!!selectedRecipe}
                    onClose={() => setSelectedRecipe(null)}
                />
            )}

            {editModeMealPlan && (
                <EditMealPlanModal
                    mealPlan={editModeMealPlan}
                    isOpen={!!editModeMealPlan}
                    onClose={() => setEditModeMealPlan(null)}
                    onAssign={handleAssign}
                    onUnassign={handleUnassign}
                    assignEmail={assignEmail}
                    setAssignEmail={setAssignEmail}
                />
            )}
        </div>
    );
};

export default MealPlanDetail;