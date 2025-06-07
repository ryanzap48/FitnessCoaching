import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import RecipeCard from './recipe/RecipeCard';
import RecipeModal from './recipe/RecipeModal';
import EditRecipeModal from './recipe/EditRecipeModal';

const RecipeList = () => {
  const { token } = useAuth();
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [editModeRecipe, setEditModeRecipe] = useState(null);
  const [recipes, setRecipes] = useState([]);

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

  useEffect(() => {
    fetch('http://localhost:9000/recipes', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        const withEmailInput = data.map(w => ({ ...w, assignEmail: '' }));
        setRecipes(withEmailInput);
      })
      .catch(err => console.error(err));
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;

    const res = await fetch(`http://localhost:9000/recipes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setRecipes(prev => prev.filter(w => w._id !== id));
      if (selectedRecipe?._id === id) setSelectedRecipe(null);
      if (editModeRecipe?._id === id) setEditModeRecipe(null);
    }
  };

  const handleAssign = async (id, email) => {
    if (!email) return alert('Please enter a valid email.');

    const res = await fetch(`http://localhost:9000/recipes/${id}/assign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userEmail: email }),
    });

    if (res.ok) {
      const updated = await res.json();
      setRecipes(prev =>
        prev.map(w =>
          w._id === id ? { ...updated, assignEmail: '' } : w
        )
      );
      if (editModeRecipe && editModeRecipe._id === id) {
        setEditModeRecipe({ ...updated, assignEmail: '' });
      }
    }
  };

  const handleUnassign = async (recipeId, userEmail) => {
    if (!window.confirm(`Unassign ${userEmail}?`)) return;

    const res = await fetch(`http://localhost:9000/recipes/${recipeId}/unassign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userEmail }),
    });

    if (res.ok) {
      const updated = await res.json();
      setRecipes(prev =>
        prev.map(w =>
          w._id === recipeId ? { ...updated, assignEmail: '' } : w
        )
      );
      if (editModeRecipe && editModeRecipe._id === recipeId) {
        setEditModeRecipe({ ...updated, assignEmail: '' });
      }
    }
  };

  const handleAssignEmailChange = (id, email) => {
    setRecipes(prev =>
      prev.map(recipe =>
        recipe._id === id ? { ...recipe, assignEmail: email } : recipe
      )
    );
  };

  return (
    <div style={{marginTop: '40px'}}>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem', transform: 'scale(0.7)', transformOrigin: 'top center' }}>
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe._id}
            recipe={recipe}
            onCardClick={setSelectedRecipe}
            onEdit={setEditModeRecipe}
            onDelete={handleDelete}
            onAssign={handleAssign}
            onUnassign={handleUnassign}
            onAssignEmailChange={handleAssignEmailChange}
          />
        ))}
      </div>

      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          isOpen={!!selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}

      {editModeRecipe && (
        <EditRecipeModal
          recipe={editModeRecipe}
          isOpen={!!editModeRecipe}
          onClose={() => setEditModeRecipe(null)}
          onAssign={handleAssign}
          onUnassign={handleUnassign}
        />
      )}
    </div>
  );
};

export default RecipeList;
