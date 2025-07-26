import { useState, useEffect } from 'react';
import recipeImageMap from '../../../image-mapping/RecipeImageMap';
import { FaArrowLeft } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

export default function CreateRecipe() {
  const location = useLocation(); // Add this line
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [category, setCategory] = useState('');
  const [foodClass, setFoodClass] = useState([]);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [servings, setServings] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [instructions, setInstructions] = useState(['']);
  const [editingDraftId, setEditingDraftId] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();

  const generateRecipe = async (name) => {
    if(!name) {
      alert('You need to enter a name');
      return;
    }
    const normalizedName = name.trim().toLowerCase();

    // Find image in the map
    const image = recipeImageMap[normalizedName] || null;
     console.log(name);
    console.log(image);
    
    const response = await fetch('http://localhost:9000/aigenerate/generate-recipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, image })
    });

    const data = await response.json();
    console.log(data); // Show generated recipe
    navigate('/adminrecipes');
  };

  // Update the useEffect to only run once when component mounts with draft data
  useEffect(() => {
    const draftData = location?.state?.draft;
    if (draftData) {
      setEditingDraftId(draftData._id);
      
      setName(draftData.name || '');
      setDescription(draftData.description || '');
      setCalories(draftData.calories || '');
      setProtein(draftData.protein || '');
      setCarbs(draftData.carbs || '');
      setFats(draftData.fats || '');
      setCategory(draftData.category || '');
      setFoodClass(draftData.foodClass || '');
      setEstimatedTime(draftData.estimatedTime || '');
      setServings(draftData.servings || '');
      setIngredients(draftData.ingredients || []);
      setInstructions(draftData.instructions || []);
      setImageUrl(draftData.imageUrl || '');
    
    
    }
  }, [location?.state?.draft]);

  const handleSaveDraft = async () => {
    // First check if name is provided
    if (!name.trim()) {
      setMessage("Name is required to save a draft.");
      return;
    }

    const draftPayload = {
      name,
      calories: calories || undefined,
      description: description || undefined,
      protein: protein || undefined,
      carbs: carbs || undefined,
      fats: fats || undefined,
      category: category || undefined,
      foodClass: foodClass || undefined,
      estimatedTime: estimatedTime || undefined,
      servings: servings || undefined,
      ingredients: ingredients || undefined,
      instructions: instructions || undefined,


      imageUrl: imageUrl || undefined,
      
      isDraft: true,
    };

    try {
      const url = editingDraftId
        ? `http://localhost:9000/recipes/${editingDraftId}`
        : 'http://localhost:9000/recipes/create';

      const method = editingDraftId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draftPayload),
      });

      if (res.ok) {
        navigate('/adminrecipes');
      } else {
        const data = await res.json();
        setMessage(`❌ ${data.message || 'Failed to save draft.'}`);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      setMessage('❌ Server error while saving draft.');
    }
  };

  const toggleSelection = (value, setFn, current) => {
    const isSelected = current.includes(value);
    if (isSelected) {
      setFn(current.filter(v => v !== value));
    } else {
      if (current.length >= 4) {
        // Remove the first selected item and add the new one
        const newSelection = [...current.slice(1), value];
        setFn(newSelection);
      } else {
        setFn([...current, value]);
      }
    }
  };

  const handleIngredientChange = (idx, value) => {
    const newIngredients = [...ingredients];
    newIngredients[idx] = value;
    setIngredients(newIngredients);
  };

  const addIngredient = () => setIngredients([...ingredients, '']);
  
  const removeIngredient = (idx) => {
    const newIngredients = ingredients.filter((_, i) => i !== idx);
    setIngredients(newIngredients.length ? newIngredients : ['']);
  };



  const handleInstructionChange = (idx, value) => {
    const newInstructions = [...instructions];
    newInstructions[idx] = value;
    setInstructions(newInstructions);
  };

  const addInstruction = () => setInstructions([...instructions, '']);
  
  const removeInstruction = (idx) => {
    const newInstructions = instructions.filter((_, i) => i !== idx);
    setInstructions(newInstructions.length ? newInstructions : ['']);
  };



  const handleNameChange = (value) => {
    setName(value);
    setImageUrl('');
    const normalizedName = value.trim().toLowerCase();
    const mappedImage = recipeImageMap[normalizedName];
    if (mappedImage && !imageUrl) {
        setImageUrl(mappedImage);
      }
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const recipeData = {
      name,
      description,
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fats: Number(fats),
      category,
      foodClass,
      estimatedTime,
      servings,
      ingredients,
      instructions,
      isDraft: false, // Mark it finalized
      imageUrl,
      
    };

    try {
      const url = editingDraftId
        ? `http://localhost:9000/recipes/${editingDraftId}`
        : `http://localhost:9000/recipes/create`;

      const method = editingDraftId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Recipe created successfully!');
        setEditingDraftId(null); // Clear draft editing mode

        setName('');
        setDescription('');
        setCalories('');
        setProtein('');
        setCarbs('');
        setFats('');
        setCategory([]);
        setFoodClass([]);
        setEstimatedTime('');
        setServings('');
        setIngredients(['']);
        setInstructions(['']);
        setImageUrl('');

        navigate('/adminrecipes');
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
      width: '100vw' // Add this for mobile responsiveness
    },
    input: {
      width: '97%',
      padding: '0.75rem',
      marginBottom: '1rem',
      borderRadius: '6px',
      border: '1px solid #ccc',
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
    chip: (active) => ({
      padding: '0.5rem 1rem',
      margin: '0.25rem',
      borderRadius: '20px',
      border: '1px solid #ccc',
      background: active ? '#007bff' : '#e0e0e0',
      color: active ? '#fff' : '#000',
      cursor: 'pointer',
  }),
    message: {
      marginTop: '1rem',
      fontWeight: 'bold',
      color: message.startsWith('✅') ? 'green' : 'red',
    }
  };

  return (
    <div style={{ 
                padding: '1.5rem',
                margin: 'auto',
                display: 'flex',
                justifyContent: 'center'
                }}>
      <form onSubmit={handleSubmit} style={styles.form}>  
        <input style={styles.input} placeholder="Name" value={name} onChange={(e) => handleNameChange(e.target.value)} required />
        
        
        <textarea style={styles.input} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />

        <input style={styles.input} type="number" placeholder="Calories" value={calories} onChange={(e) => setCalories(e.target.value)} required />
        <input style={styles.input} type="number" placeholder="Protein (g)" value={protein} onChange={(e) => setProtein(e.target.value)} required />
        <input style={styles.input} type="number" placeholder="Carbs (g)" value={carbs} onChange={(e) => setCarbs(e.target.value)} required />
        <input style={styles.input} type="number" placeholder="Fats (g)" value={fats} onChange={(e) => setFats(e.target.value)} required />

        <input style={styles.input} placeholder="Estimated Time (e.g., 30 mins)" value={estimatedTime} onChange={(e) => setEstimatedTime(e.target.value)} required />
        <input style={styles.input} placeholder="Servings (e.g., 2-4)" value={servings} onChange={(e) => setServings(e.target.value)} required />

        <div><strong>Category:</strong></div>
        {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(cat => (
          <button type="button" key={cat} style={styles.chip(category === cat)} onClick={() => setCategory(cat)}>
            {category === cat ? `✓ ${cat}` : cat}
          </button>
        ))}

        <div style={{ marginTop: '1rem' }}><strong>Food Class:</strong></div>
        {['Low Carb', 'High Protein', 'Nut Free', 'Vegan', 'Vegetarian', 'Gluten Free', 'Dairy Free', 'Paleo', 'Keto', 'Whole30', 'Low Fat', 'Sugar Free', 'Low Sodium', 'High Fiber', 'Heart Healthy', 'Diabetic Friendly', 'Anti-Inflammatory', 'Plant Based', 'Raw', 'Meal Prep Friendly', 'Quick & Easy', 'Comfort Food', 'High Calorie'].map(cls => (
          <button type="button" key={cls} style={styles.chip(foodClass.includes(cls))} onClick={() => toggleSelection(cls, setFoodClass, foodClass)}>
            {foodClass.includes(cls) ? `✓ ${cls}` : cls}
          </button>
        ))}

        
        <div style={{ marginTop: '1rem' }}><strong>Instructions:</strong></div>
        {instructions.map((instr, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              style={{ ...styles.input, flex: 1, marginBottom: '.25rem' }}
              placeholder={`Step ${idx + 1}`}
              value={instr}
              onChange={(e) => handleInstructionChange(idx, e.target.value)}
              required
            />
            <button type="button" style={{ ...styles.button, backgroundColor: '#dc3545', color: '#fff', marginBottom: '.25rem' }} onClick={() => removeInstruction(idx)}>✖</button>
          </div>
        ))}
        <button type="button" style={{ ...styles.button, backgroundColor: '#6c757d', color: '#fff' }} onClick={addInstruction}>+ Add Step</button>
        
        <div style={{ marginTop: '1rem' }}><strong>Ingredients:</strong></div>
        {ingredients.map((instr, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              style={{ ...styles.input, flex: 1 , marginBottom: '.25rem' }}
              placeholder={`Ingredient ${idx + 1}`}
              value={instr}
              onChange={(e) => handleIngredientChange(idx, e.target.value)}
              required
            />
            <button type="button" style={{ ...styles.button, backgroundColor: '#dc3545', color: '#fff', marginBottom: '0.25rem' }} onClick={() => removeIngredient(idx)}>✖</button>
          </div>
        ))}
        <button type="button" style={{ ...styles.button, backgroundColor: '#6c757d', color: '#fff' }} onClick={addIngredient}>+ Add Ingredient</button>
        

        <input
          style={{...styles.input, marginTop: '1rem'}}
          placeholder="Optional Image URL (Overrides Default)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />

        <div style={{display: 'flex', gap: '1rem'}}>
          <button type="submit" style={{ ...styles.button, backgroundColor: '#28a745', color: '#fff' }}>Submit Recipe</button>
          <button onClick={() => generateRecipe(name)} 
                    style={{ ...styles.button, backgroundColor: 'rgb(25, 37, 94)', color: '#fff' }}
            >
              Ai Generate
            </button>

            <button 
              type="button" 
              style={{ ...styles.button, backgroundColor: 'rgb(87, 20, 20)', color: '#fff' }} 
              onClick={handleSaveDraft}
            >
              Save as Draft
          </button>
          </div>

        
      
        {message && <p style={styles.message}>{message}</p>}
      </form>
    </div>
  );
}
