import { useState, useEffect, useRef, useMemo } from 'react';
import mealPlanImageMap from '../../../image-mapping/mealPlanImageMap';
import { debounce } from 'lodash';
import { useLocation, useNavigate } from 'react-router-dom'; // Add this import
import { FaArrowLeft } from 'react-icons/fa';

const categories = ['breakfast', 'lunch', 'dinner', 'snack'];
const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function CreateMealPlan() {
  const location = useLocation(); // Add this line

  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [proteinPercent, setProteinPercent] = useState('');
  const [carbPercent, setCarbPercent] = useState('');
  const [fatPercent, setFatPercent] = useState('');
  const [duration, setDuration] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [userEmailInput, setUserEmailInput] = useState('');
  const [message, setMessage] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 568);
  const [editingDraftId, setEditingDraftId] = useState(null);
  const navigate = useNavigate();

  const [percentError, setPercentError] = useState('');

  const [currentDayIdx, setCurrentDayIdx] = useState(0);

  // Week state: day -> category -> array of recipe names
  const [week, setWeek] = useState(() =>
    Object.fromEntries(days.map(day => [day, Object.fromEntries(categories.map(c => [c, ['']]))]))
  );

  // Store recipe IDs corresponding to week structure (same shape as week)
  // Initialized to empty strings
  const [weekRecipeIds, setWeekRecipeIds] = useState(() =>
    Object.fromEntries(days.map(day => [day, Object.fromEntries(categories.map(c => [c, ['']]))]))
  );

  // Validation errors per recipe slot, same shape as week
  // Each error string corresponds to that recipe input
  const [validationErrors, setValidationErrors] = useState(() =>
    Object.fromEntries(days.map(day => [day, Object.fromEntries(categories.map(c => [c, ['']]))]))
  );

  const [weekRecipeInfo, setWeekRecipeInfo] = useState(() =>
    Object.fromEntries(days.map(day => 
      [day, Object.fromEntries(categories.map(c => [c, [{}]]))]
    ))
  );
    // Top of your component
  // Calculate daily totals based on meal AVERAGES
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 568);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const dailyTotals = useMemo(() => {
    const totals = {};

    const calculateDailyTotals = (day) => {
        let dailyTotal = { calories: 0, protein: 0, carbs: 0, fats: 0 };
        let recipeCount = 0;

        categories.forEach(category => {
            const recipeInfos = weekRecipeInfo[day]?.[category] || [];
            const validRecipes = recipeInfos.filter(recipeInfo => 
                recipeInfo && Object.keys(recipeInfo).length > 0
            );
            
            if (validRecipes.length > 0) {
                // Calculate average for this meal category
                const mealAverage = {
                    calories: validRecipes.reduce((sum, recipe) => sum + (Number(recipe.calories) || 0), 0) / validRecipes.length,
                    protein: validRecipes.reduce((sum, recipe) => sum + (Number(recipe.protein) || 0), 0) / validRecipes.length,
                    carbs: validRecipes.reduce((sum, recipe) => sum + (Number(recipe.carbs) || 0), 0) / validRecipes.length,
                    fats: validRecipes.reduce((sum, recipe) => sum + (Number(recipe.fats) || 0), 0) / validRecipes.length,
                };
                
                // Add meal average to daily total
                dailyTotal.calories += mealAverage.calories;
                dailyTotal.protein += mealAverage.protein;
                dailyTotal.carbs += mealAverage.carbs;
                dailyTotal.fats += mealAverage.fats;
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
}, [weekRecipeInfo]);

const weeklyAverage = useMemo(() => {
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
}, [dailyTotals]);

 

  const currentDay = days[currentDayIdx];




  const handleMacroChange = (field, newValue) => {
    let newProtein = proteinPercent;
    let newCarb = carbPercent;
    let newFat = fatPercent;

    if (field === 'protein') {
      newProtein = newValue;
      setProteinPercent(newValue);
    } else if (field === 'carb') {
      newCarb = newValue;
      setCarbPercent(newValue);
    } else if (field === 'fat') {
      newFat = newValue;
      setFatPercent(newValue);
    }

    const allFilled =
      newProtein !== '' &&
      newCarb !== '' &&
      newFat !== '';

    const total =
      Number(newProtein || 0) +
      Number(newCarb || 0) +
      Number(newFat || 0);


    if (allFilled) {
      if (!isNaN(total) && total !== 100) {
        setPercentError(`(${total}%)`);
      } else {
        setPercentError('');
      }
    } else {
      setPercentError('');
    }
  };


// Function to load recipe names from IDs - using useRef to avoid dependency issues
const loadRecipeNamesFromIdsRef = useRef();
loadRecipeNamesFromIdsRef.current = async (weekIds) => {
  try {
    // 1. Collect all unique recipe IDs and normalize them to strings
    const allIds = [];
    days.forEach(day => {
      categories.forEach(cat => {
        const recipeIds = weekIds[day]?.[cat] || [];
        recipeIds.forEach(id => {
          if (id && !allIds.includes(id.toString())) { // Convert to string here
            allIds.push(id.toString()); // Store as string
          }
        });
      });
    });

  

    if (allIds.length === 0) return;

    // 2. Fetch recipes
    const response = await fetch('http://localhost:9000/recipes/by-ids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: allIds })
    });
    const recipes = await response.json();
   

    // 3. Create lookup map using normalized string IDs
    const recipeMap = {};
    recipes.forEach(recipe => {
      const idString = recipe._id.toString(); // Ensure string format
      recipeMap[idString] = recipe;
    
    });

    // 4. Update state with strict string comparison
    const updatedWeek = { ...week };
    const updatedWeekInfo = { ...weekRecipeInfo };

    days.forEach(day => {
      updatedWeek[day] = updatedWeek[day] || {};
      updatedWeekInfo[day] = updatedWeekInfo[day] || {};
      
      categories.forEach(cat => {
        const recipeIds = weekIds[day]?.[cat] || [];
        
        updatedWeek[day][cat] = recipeIds.map(id => {
          const idString = id.toString(); // Normalize to string
          const recipe = recipeMap[idString];
         
          return recipe?.name || '';
        });

        updatedWeekInfo[day][cat] = recipeIds.map(id => {
          const idString = id.toString();
          const recipe = recipeMap[idString];
          return recipe ? {
            calories: recipe.calories,
            protein: recipe.protein,
            carbs: recipe.carbs,
            fats: recipe.fats,
            imageUrl: recipe.imageUrl,
          } : {};
        });
      });
    });

    setWeek(updatedWeek);
    setWeekRecipeInfo(updatedWeekInfo);
  } catch (error) {
    console.error('Error loading recipes:', error);
  }
};

// Update the useEffect to only run once when component mounts with draft data
useEffect(() => {
  const draftData = location?.state?.draft;
  if (draftData) {
    setEditingDraftId(draftData._id);
    
    setName(draftData.name || '');
    setCalories(draftData.calories || '');
    setProteinPercent(draftData.proteinPercent || '');
    setCarbPercent(draftData.carbPercent || '');
    setFatPercent(draftData.fatPercent || '');
    setDuration(draftData.duration || '');
    setImageUrl(draftData.imageUrl || '');
    
    // Initialize the week structure with all days and categories
    const initialWeek = Object.fromEntries(days.map(day => 
      [day, Object.fromEntries(categories.map(c => [c, ['']]))]
    ));
    
    const initialWeekRecipeIds = Object.fromEntries(days.map(day => 
      [day, Object.fromEntries(categories.map(c => [c, ['']]))]
    ));
    
    const initialWeekRecipeInfo = Object.fromEntries(days.map(day => 
      [day, Object.fromEntries(categories.map(c => [c, [{}]]))]
    ));
    
    // If draft has week data, merge it with the initialized structure
    if (draftData.week) {
      days.forEach(day => {
        categories.forEach(cat => {
          if (draftData.week[day]?.[cat]?.length > 0) {
            // Replace the empty slot with draft data
            initialWeek[day][cat] = [...draftData.week[day][cat].map(() => '')];
            initialWeekRecipeIds[day][cat] = [...draftData.week[day][cat]];
          }
        });
      });
    }
    
    setWeek(initialWeek);
    setWeekRecipeIds(initialWeekRecipeIds);
    setWeekRecipeInfo(initialWeekRecipeInfo);
    
    // Convert IDs back to recipe names for display
    if (draftData.week) {
      loadRecipeNamesFromIdsRef.current(draftData.week);
    }
  }
}, [location?.state?.draft]);



  const handleNameChange = (value) => {
    setName(value);
    setImageUrl('');
    const normalizedName = value.trim().toLowerCase();
    const mappedImage = mealPlanImageMap[normalizedName];
    if (mappedImage && !imageUrl) {
      setImageUrl(mappedImage);
    }
  };

  // Validate a single recipe name for a specific day/category/index
  // This calls backend and sets error or stores ID
  const validateRecipeName = async (day, category, idx, recipeName) => {
    if (!recipeName.trim()) {
      // If input is cleared, reset validation error, ID, and nutrition info
      setValidationErrors(prev => {
        const updated = { ...prev };
        updated[day][category][idx] = '';
        return updated;
      });

      setWeekRecipeIds(prev => {
        const updated = { ...prev };
        updated[day][category][idx] = '';
        return updated;
      });

      setWeekRecipeInfo(prev => {
        const updated = { ...prev };
        updated[day][category][idx] = {};
        return updated;
      });

      return;
    }

    try {
      const response = await fetch('http://localhost:9000/recipes/validate-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ names: [recipeName] })
      });
      

      const data = await response.json();

      if (data.notFoundNames.length > 0) {
        // Not found: show error, clear ID and info
        setValidationErrors(prev => {
          const updated = { ...prev };
          updated[day][category][idx] = `"${recipeName}" not found`;
          return updated;
        });

        setWeekRecipeIds(prev => {
          const updated = { ...prev };
          updated[day][category][idx] = '';
          return updated;
        });

        setWeekRecipeInfo(prev => {
          const updated = { ...prev };
          updated[day][category][idx] = {};
          return updated;
        });

      } else {
        const foundRecipe = data.foundRecipes[0];

        // Found: set ID, clear error, and set nutrition info
        setValidationErrors(prev => {
          const updated = { ...prev };
          updated[day][category][idx] = '';
          return updated;
        });

        setWeekRecipeIds(prev => {
          const updated = { ...prev };
          updated[day][category][idx] = foundRecipe.id;
          return updated;
        });

        setWeekRecipeInfo(prev => {
          const updated = { ...prev };
          updated[day][category][idx] = {
            calories: foundRecipe.calories,
            protein: foundRecipe.protein,
            carbs: foundRecipe.carbs,
            fats: foundRecipe.fats,
            imageUrl: foundRecipe.imageUrl,
          };
          return updated;
        });
      }
    } catch (error) {
      console.error('Error validating recipe name:', error);
    }
};

const debouncedValidate = useRef(debounce((...args) => validateRecipeName(...args), 25)).current;


const handleRecipeChange = (day, category, idx, value) => {
  const trimmedValue = value.trim().toLowerCase();
  const currentRecipes = week[day][category].map(r => r.trim().toLowerCase());

  // Check for duplicate in the same meal block (ignore current index)
  const isDuplicate = currentRecipes.some((r, i) => i !== idx && r === trimmedValue);

  const updatedWeek = { ...week };
  updatedWeek[day][category][idx] = value;
  setWeek(updatedWeek);

  const updatedErrors = { ...validationErrors };
  if (isDuplicate) {
    updatedErrors[day][category][idx] = `"${value}" is already added in this meal block`;
    setValidationErrors(updatedErrors);
    setWeekRecipeIds(prev => {
      const updated = { ...prev };
      updated[day][category][idx] = '';
      return updated;
    });
    return;
  } else {
    updatedErrors[day][category][idx] = '';
    setValidationErrors(updatedErrors);
  }

  // Validate via backend
  debouncedValidate(day, category, idx, value);
};

  const addRecipeSlot = (day, category) => {
    const updatedWeek = { ...week };
    const updatedIds = { ...weekRecipeIds };
    const updatedErrors = { ...validationErrors };

    const updatedInfo = { ...weekRecipeInfo };
    updatedInfo[day][category].push({});
    setWeekRecipeInfo(updatedInfo);

    if (updatedWeek[day][category].length < 5) {
      updatedWeek[day][category].push('');
      updatedIds[day][category].push('');
      updatedErrors[day][category].push('');
      setWeek(updatedWeek);
      setWeekRecipeIds(updatedIds);
      setValidationErrors(updatedErrors);
    }
  };

  const removeRecipeSlot = (day, category, idx) => {
    const updatedWeek = { ...week };
    const updatedIds = { ...weekRecipeIds };
    const updatedErrors = { ...validationErrors };

    const updatedInfo = { ...weekRecipeInfo };
    updatedInfo[day][category].splice(idx, 1);
    if (updatedInfo[day][category].length === 0) {
      updatedInfo[day][category].push({});
    }
    setWeekRecipeInfo(updatedInfo);
    updatedWeek[day][category].splice(idx, 1);
    updatedIds[day][category].splice(idx, 1);
    updatedErrors[day][category].splice(idx, 1);

    if (updatedWeek[day][category].length === 0) {
      updatedWeek[day][category].push('');
      updatedIds[day][category].push('');
      updatedErrors[day][category].push('');
    }

    setWeek(updatedWeek);
    setWeekRecipeIds(updatedIds);
    setValidationErrors(updatedErrors);
  };

  const goToDay = (offset) => {
    setCurrentDayIdx((prev) => (prev + offset + 7) % 7);
  };

  const handleSaveDraft = async () => {
    // First check if name is provided
    if (!name.trim()) {
      setMessage("Name is required to save a draft.");
      return;
    }

    // Then check if userEmails/assignedTo is empty (this should be the first check after name)
    if (userEmailInput.trim() !== '') {
      console.log('hello')
      setMessage("Drafts cannot have assigned users. Please clear the email field.");
      return;
    }

    // Only after those checks, proceed with saving the draft
    // Filter out empty recipe slots for drafts
    const cleanedWeek = {};
    days.forEach(day => {
      cleanedWeek[day] = {};
      categories.forEach(cat => {
        // Only include non-empty recipe IDs
        cleanedWeek[day][cat] = weekRecipeIds[day][cat].filter(id => id && id.trim() !== '');
      });
    });

    const draftPayload = {
      name,
      calories: calories || undefined,
      proteinPercent: proteinPercent || undefined,
      carbPercent: carbPercent || undefined,
      fatPercent: fatPercent || undefined,
      duration: duration || undefined,
      imageUrl: imageUrl || undefined,
      userEmails: [],
      week: cleanedWeek,
      isDraft: true,
    };

    try {
      const url = editingDraftId
        ? `http://localhost:9000/mealplans/${editingDraftId}`
        : 'http://localhost:9000/mealplans/create';

      const method = editingDraftId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draftPayload),
      });

      if (res.ok) {
        navigate('/adminmealplans');
      } else {
        const data = await res.json();
        setMessage(`❌ ${data.message || 'Failed to save draft.'}`);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      setMessage('❌ Server error while saving draft.');
    }
  };
  // Add this to your CreateMealPlan component

  const handleFillWithSmoothie = () => {
    const smoothieName = "Blueberry Smoothie";
    
    // Create a new week structure with all slots filled with the smoothie
    const filledWeek = Object.fromEntries(
      days.map(day => [
        day, 
        Object.fromEntries(
          categories.map(cat => [cat, Array(week[day][cat].length).fill(smoothieName)])
        )
      ])
    );
    
    // Create corresponding recipe IDs (empty since these are temporary)
    const filledRecipeIds = Object.fromEntries(
      days.map(day => [
        day, 
        Object.fromEntries(
          categories.map(cat => [cat, Array(weekRecipeIds[day][cat].length).fill('')])
        )
      ])
    );

    setWeek(filledWeek);
    setWeekRecipeIds(filledRecipeIds);
    setMessage('Filled with Blueberry Smoothie!');
    
    // Validate all the smoothie entries
    days.forEach(day => {
      categories.forEach(cat => {
        week[day][cat].forEach((_, idx) => {
          validateRecipeName(day, cat, idx, smoothieName);
        });
      });
    });
  };

  // Add this function to your component
  const handleClearAllMeals = () => {
    // Reset all meal slots to empty
    const clearedWeek = Object.fromEntries(
      days.map(day => [
        day,
        Object.fromEntries(
          categories.map(cat => [cat, ['']]) // Single empty slot per category
        )
      ])
    );

    const clearedRecipeIds = Object.fromEntries(
      days.map(day => [
        day,
        Object.fromEntries(
          categories.map(cat => [cat, ['']]) // Single empty slot per category
        )
      ])
    );

    const clearedRecipeInfo = Object.fromEntries(
      days.map(day => [
        day,
        Object.fromEntries(
          categories.map(cat => [cat, [{}]]) // Single empty slot per category
        )
      ])
    );

    setWeek(clearedWeek);
    setWeekRecipeIds(clearedRecipeIds);
    setWeekRecipeInfo(clearedRecipeInfo);
    setMessage('Meals cleared!');
  };
    
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.preventDefault();


    // Check that all days have at least one recipe in each category
    const hasEmptyMeals = days.some(day => 
      categories.some(cat => 
        weekRecipeIds[day][cat].every(id => !id || id.trim() === '')
      )
    );

    if (hasEmptyMeals) {
      setMessage('❌ Please ensure every day has at least one recipe in each meal category.');
      return;
    }


      // Check that all recipe fields are filled
    for (const day of days) {
      for (const cat of categories) {
        for (const recipeName of week[day][cat]) {
          if (!recipeName || recipeName.trim() === '') {
            setMessage('❌ Please fill out all recipe slots for every day.');
            return;
          }
        }
      }
    }


    // Before submitting, check if any validationErrors are present
    for (const day of days) {
      for (const cat of categories) {
        for (const errMsg of validationErrors[day][cat]) {
          if (errMsg && errMsg.length > 0) {
            setMessage('❌ Fix recipe errors before submitting.');
            return;
          }
        }
      }
    }
        // Ensure macronutrient percentages add up to 100
   if (percentError) {
      return; // Block submit silently since user already sees inline error
    }


    // Prepare payload, but for recipes send their IDs, not names
    // weekRecipeIds has the same shape as week but with recipe IDs or ''
    const userEmails = userEmailInput
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    const payload = {
      name,
      calories,
      proteinPercent,
      carbPercent,
      fatPercent,
      duration,
      imageUrl,
      isDraft: false, // Mark it finalized
      userEmails,
      week: weekRecipeIds,
    };

    try {
      const url = editingDraftId
        ? `http://localhost:9000/mealplans/${editingDraftId}`
        : `http://localhost:9000/mealplans/create`;

      const method = editingDraftId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Meal plan created!');
        setEditingDraftId(null); // Clear draft editing mode
        // Reset all inputs
        setName('');
        setCalories('');
        setProteinPercent('');
        setCarbPercent('');
        setFatPercent('');
        setDuration('');
        setImageUrl('');
        setUserEmailInput('');
        setWeek(Object.fromEntries(days.map(day => [day, Object.fromEntries(categories.map(c => [c, ['']]))])));
        setWeekRecipeIds(Object.fromEntries(days.map(day => [day, Object.fromEntries(categories.map(c => [c, ['']]))])));
        setValidationErrors(Object.fromEntries(days.map(day => [day, Object.fromEntries(categories.map(c => [c, ['']]))])));
        setCurrentDayIdx(0);

        navigate('/adminmealplans');
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Server error');
    }
  };

  const styles = {
  container: {
    padding: '1.5rem',
    margin: 'auto',
    display: 'flex',
    justifyContent: 'center'
  },
  form: {
    fontFamily: 'sans-serif',
    width: '100vw' // Add this for mobile responsiveness
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0rem',
    marginBottom: '0rem',
    marginTop: '0rem',
    minHeight: '2.93rem'
  },
  weeklyAvgContainer: {
    marginBottom: '0.75rem'
  },
  weeklyAvgText: {
    fontSize: '0.9rem',
    color: '#555',
    whiteSpace: 'nowrap'
  },
  macroContainer: {
    fontSize: '0.85rem',
    color: '#555',
    marginBottom: '.5rem',
    display: 'flex',
    gap: '2rem',
    alignItems: 'center',
    minHeight: '1.25rem'
  },
  macroContainerVisible: {
    visibility: 'visible'
  },
  macroContainerHidden: {
    visibility: 'hidden'
  },
  inputContainer: {
    minHeight: '4.75rem'  // will be overridden for mobile
  },
  inputContainerMobile: {
    minHeight: '13.75rem'
  },
  error: {
    color: 'red',
    fontSize: '0.85rem',
    marginTop: '0.5rem',
    marginBottom: '0.75rem'
  },
  dayNavigation: {
    minHeight: '3rem'
  },
  dayNavControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '.75rem',
    marginTop: '1rem',
    marginBottom: '0.25rem'
  },
  dayContainer: {
    minWidth: '158px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  dayTitle: {
    margin: 0,
    textAlign: 'center',
    width: '100%'
  },
  dayTotals: {
    fontSize: '0.75rem',
    color: '#555',
    textAlign: 'center'
  },
  categoryContainer: {
    marginTop: '1rem'
  },
  categoryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  categoryAvg: {
    fontSize: '0.9rem',
    color: '#555'
  },
  nutritionInfo: {
    fontSize: '0.75rem',
    color: '#555',
    minHeight: '1rem'
  },
  recipeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  imageContainer: {
    width: '40px',
    height: '40px',
    backgroundColor: '#ffffff',
    borderRadius: '4px',
    overflow: 'hidden',
    flexShrink: 0
  },
  recipeImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  input: {
    flex: 1,
    padding: '0.55rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    
  },
  validationErrorContainer: {
    minHeight: '1.25rem',
    marginLeft: '47px'
  },
  validationError: {
    color: 'red'
  },
  button: {
    border: 'none',
    borderRadius: '4px',
    padding: '9px 20px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
},
};

return (
  <div style={styles.container}>
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.header}>
        <div style={styles.weeklyAvgContainer}>
          {weeklyAverage && weeklyAverage?.calories > 0 && (
            <span style={styles.weeklyAvgText}>
              Weekly Avg: {weeklyAverage?.calories} kcal | {weeklyAverage?.protein}P ({Math.round((weeklyAverage?.protein * 4 / weeklyAverage?.calories) * 100)}%) /
              {weeklyAverage.carbs}C ({Math.round((weeklyAverage.carbs * 4 / weeklyAverage.calories) * 100)}%) /
              {weeklyAverage.fats}F ({Math.round((weeklyAverage.fats * 9 / weeklyAverage.calories) * 100)}%)
            </span>
          )}
        </div>
      </h2>
      
      <div style={isMobile ? styles.inputContainerMobile : styles.inputContainer}>
        {/* Macronutrient gram display */}
        <div style={{
          ...styles.macroContainer,
          ...(calories ? styles.macroContainerVisible : styles.macroContainerHidden)
        }}>
          <span>
            Protein: {proteinPercent && !isNaN(proteinPercent)
              ? `${Math.round(((calories * proteinPercent) / 100 / 4) * 10) / 10}g`
              : '—'}
          </span>
          <span>
            Carbs: {carbPercent && !isNaN(carbPercent)
              ? `${Math.round(((calories * carbPercent) / 100 / 4) * 10) / 10}g`
              : '—'}
          </span>
          <span>
            Fats: {fatPercent && !isNaN(fatPercent)
              ? `${Math.round(((calories * fatPercent) / 100 / 9) * 10) / 10}g`
              : '—'}
          </span>
        </div>

        {/* Input Fields */}
        {/* Name (max 25 chars) */}
        <input
          value={name}
          id="name"
          placeholder="Name"
          maxLength={25}
          onChange={(e) => handleNameChange(e.target.value)}
          required
          style={{...styles.input}}
        />

        {/* Calories (digits only, max 5 digits, no leading zero) */}
        <input
          value={calories}
          id="calories"
          onChange={(e) => {
            const val = e.target.value;
            if (/^\d{0,5}$/.test(val) && (val === '' || !/^0\d+/.test(val))) {
              setCalories(val);
            }
          }}
          placeholder="Calories"
          required
          style={{...styles.input}}
        />

        {/* Protein (%) (digits only, max 2 digits, no leading zero) */}
        <input
          value={proteinPercent}
          id="proteinPercent"
          onChange={(e) => {
            const val = e.target.value;
            if (/^\d{0,2}$/.test(val) && (val === '' || !/^0\d+/.test(val))) {
              handleMacroChange('protein', val);
            }
          }}
          placeholder="Protein (%)"
          required
          style={{...styles.input}}
        />

        {/* Carb (%) (digits only, max 2 digits, no leading zero) */}
        <input
          value={carbPercent}
          id="carbPercent"
          onChange={(e) => {
            const val = e.target.value;
            if (/^\d{0,2}$/.test(val) && (val === '' || !/^0\d+/.test(val))) {
              handleMacroChange('carb', val);
            }
          }}
          placeholder="Carb (%)"
          required
          style={{...styles.input}}
        />

        {/* Fat (%) (digits only, max 2 digits, no leading zero) */}
        <input
          value={fatPercent}
          id="fatPercent"
          onChange={(e) => {
            const val = e.target.value;
            if (/^\d{0,2}$/.test(val) && (val === '' || !/^0\d+/.test(val))) {
              handleMacroChange('fat', val);
            }
          }}
          placeholder="Fat (%)"
          required
          style={{...styles.input}}
        />

        {/* Duration (digits only, max 2 digits, no leading zero) */}
        <input
          value={duration}
          id="duration"
          onChange={(e) => {
            const val = e.target.value;
            if (/^\d{0,2}$/.test(val) && (val === '' || !/^0\d+/.test(val))) {
              setDuration(val);
            }
          }}
          placeholder="Duration (weeks)"
          required
          style={{...styles.input}}
        />

        {/* Image URL (no validation needed unless you want to validate URL format) */}
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Image URL (optional)"
          style={{...styles.input}}
        />

        {/* Email input (no restrictions beyond your own logic) */}
        <input
          value={userEmailInput}
          onChange={(e) => setUserEmailInput(e.target.value)}
          placeholder="Assign to users (comma-separated emails)"
          style={{...styles.input}}
        />

        {percentError && (
          <div style={styles.error}>
            {percentError}
          </div>
        )}
      </div>

      {/* Day Navigation */}
      <div style={styles.dayNavigation}>
        <div style={styles.dayNavControls}>
          <button type="button" onClick={() => goToDay(-1)} style={{border: 'none', background: 'white', fontSize: '20px', padding: '0'}}>←</button>
          
          {/* Day container with centered text */}
          <div style={styles.dayContainer}>
            <h3 style={styles.dayTitle}>
              {currentDay.toUpperCase()}
            </h3>
            {dailyTotals[currentDay]?.calories > 0 && (
              <span style={styles.dayTotals}>
                {dailyTotals[currentDay].calories} kcal | 
                {dailyTotals[currentDay].protein}P / 
                {dailyTotals[currentDay].carbs}C / 
                {dailyTotals[currentDay].fats}F
              </span>
            )}
          </div>
          
          <button type="button" onClick={() => goToDay(1)} style={{border: 'none', background: 'white', fontSize: '20px', padding: '0'}}>→</button>
        </div>
      </div>
      
      {/* Recipes for current day */}
      {categories.map(cat => {
        const recipeInfos = weekRecipeInfo[currentDay][cat];
        const validInfos = recipeInfos.filter(info => info && Object.keys(info).length > 0);

        let avg = { calories: 0, protein: 0, carbs: 0, fats: 0 };

        if (validInfos.length > 0) {
          validInfos.forEach(info => {
            avg.calories += info.calories || 0;
            avg.protein += info.protein || 0;
            avg.carbs += info.carbs || 0;
            avg.fats += info.fats || 0;
          });

          avg.calories = Math.round(avg.calories / validInfos.length);
          avg.protein = Math.round(avg.protein / validInfos.length);
          avg.carbs = Math.round(avg.carbs / validInfos.length);
          avg.fats = Math.round(avg.fats / validInfos.length);
        }

        return (
          <div key={cat} style={styles.categoryContainer}>
            <div style={styles.categoryHeader}>
              <strong>{cat.toUpperCase()}</strong>
              {validInfos.length > 0 && (
                <span style={styles.categoryAvg}>
                  {avg.calories} kcal | {avg.protein}P / {avg.carbs}C / {avg.fats}F
                </span>
              )}
            </div>
          
            {week[currentDay][cat].map((recipe, idx) => (
              <div key={idx}>
                {/* 🧠 Nutrition Info Display */}
                <div style={styles.nutritionInfo}>
                  {weekRecipeInfo[currentDay][cat][idx]?.calories != null && (
                    <span>
                      {weekRecipeInfo[currentDay][cat][idx].calories} kcal | 
                      {weekRecipeInfo[currentDay][cat][idx].protein}P / 
                      {weekRecipeInfo[currentDay][cat][idx].carbs}C / 
                      {weekRecipeInfo[currentDay][cat][idx].fats}F
                    </span>
                  )}
                </div>

                <div style={styles.recipeRow}>
                  {/* Image container with fixed size */}
                  <div style={styles.imageContainer}>
                    {weekRecipeInfo[currentDay][cat][idx]?.imageUrl ? (
                      <img
                        src={weekRecipeInfo[currentDay][cat][idx].imageUrl}
                        alt="Recipe"
                        style={styles.recipeImage}
                      />
                    ) : null}
                  </div>

                  {/* Input field with flex-grow */}
                  <input
                    value={recipe}
                    onChange={(e) => handleRecipeChange(currentDay, cat, idx, e.target.value)}
                    placeholder="Search recipe by name"
                    required
                    style={styles.input}
                  />

                  {/* Delete button */}
                  <button type="button" onClick={() => removeRecipeSlot(currentDay, cat, idx)} style={{ ...styles.button, backgroundColor: '#dc3545', color: '#fff', padding: '0.5rem 1.11rem'}}>✖</button>
                </div>

                {/* Keep space for validation error */}
                <div style={styles.validationErrorContainer}>
                  {validationErrors[currentDay][cat][idx] && (
                    <small style={styles.validationError}>
                      {validationErrors[currentDay][cat][idx]}
                    </small>
                  )}
                </div>
              </div>
            ))}
            
            {week[currentDay][cat].length < 5 && (
              <button type="button" style={{...styles.button, backgroundColor: '#6c757d', color: '#fff', padding: '5px 10px',fontSize: '11px',}}onClick={() => addRecipeSlot(currentDay, cat)}>+ Add Recipe</button>
            )}
          </div>
        )
      })}
      <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
        <button type="submit" style={{ ...styles.button, backgroundColor: '#28a745', color: '#fff' }}>Submit Meal Plan</button>
        <button 
            type="button" 
            style={{ ...styles.button, backgroundColor: 'rgb(87, 20, 20)', color: '#fff' }} 
            onClick={handleSaveDraft}
          >
            Save as Draft
        </button>
        <button 
          id='fill-all-with-blueberry-smoothie'
          type="button"
          onClick={handleFillWithSmoothie}
          style={{ ...styles.button, backgroundColor: 'rgb(87, 78, 209)', color: '#fff' }}
        >
          Fill All with Blueberry Smoothie
        </button>
        <button 
          type="button"
          onClick={handleClearAllMeals}
          style={{ ...styles.button, backgroundColor: 'rgb(58, 52, 52)', color: '#fff' }}
        >
          Clear All Meals
        </button>
      </div>
      {message && <p>{message}</p>}
    </form>
  </div>
);
}
