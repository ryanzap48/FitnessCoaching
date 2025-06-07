import React, { useState } from 'react';
import recipeImageMap from '../../../image-mapping/RecipeImageMap';

export default function CreateRecipe() {
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
  const [imageUrl, setImageUrl] = useState('');
  const [userEmailInput, setUserEmailInput] = useState('');
  const [message, setMessage] = useState('');

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

    const userEmails = userEmailInput
      .split(',')
      .map(email => email.trim())
      .filter(email => email);

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
      imageUrl,
      userEmails
    };

    try {
      const res = await fetch('http://localhost:9000/recipes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Recipe created successfully!');
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
        setUserEmailInput('');
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
      background: '#f4f4f4',
      borderRadius: '10px',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      fontFamily: 'sans-serif',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      marginBottom: '1rem',
      borderRadius: '6px',
      border: '1px solid #ccc',
    },
    button: {
      padding: '0.5rem 1rem',
      margin: '0.25rem',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
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
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>Create New Recipe</h2>

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
        <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
          <input
            style={{ ...styles.input, flex: 1 }}
            placeholder={`Step ${idx + 1}`}
            value={instr}
            onChange={(e) => handleInstructionChange(idx, e.target.value)}
            required
          />
          <button type="button" style={{ ...styles.button, backgroundColor: '#dc3545', color: '#fff' }} onClick={() => removeInstruction(idx)}>✖</button>
        </div>
      ))}
      <button type="button" style={{ ...styles.button, backgroundColor: '#6c757d', color: '#fff' }} onClick={addInstruction}>+ Add Step</button>
      
      <div style={{ marginTop: '1rem' }}><strong>Ingredients:</strong></div>
      {ingredients.map((instr, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
          <input
            style={{ ...styles.input, flex: 1 }}
            placeholder={`Ingredient ${idx + 1}`}
            value={instr}
            onChange={(e) => handleIngredientChange(idx, e.target.value)}
            required
          />
          <button type="button" style={{ ...styles.button, backgroundColor: '#dc3545', color: '#fff' }} onClick={() => removeIngredient(idx)}>✖</button>
        </div>
      ))}
      <button type="button" style={{ ...styles.button, backgroundColor: '#6c757d', color: '#fff' }} onClick={addIngredient}>+ Add Ingredient</button>
      

      <input
        style={styles.input}
        placeholder="Optional Image URL (Overrides Default)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />


      <input
        style={styles.input}
        placeholder="Assign to Emails (comma-separated) (optional)"
        value={userEmailInput}
        onChange={(e) => setUserEmailInput(e.target.value)}
      />

      <button type="submit" style={{ ...styles.button, backgroundColor: '#28a745', color: '#fff', marginTop: '1rem' }}>Submit Recipe</button>
      {message && <p style={styles.message}>{message}</p>}
    </form>
  );
}
