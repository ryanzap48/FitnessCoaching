import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import RecipeCard from './recipe/RecipeCard';
import RecipeModal from './recipe/RecipeModal';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const RecipeList = () => {
  const { token } = useAuth();
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [viewingDrafts, setViewingDrafts] = useState(false);

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

  const fetchRecipes = async () => {
    try {
      const res = await fetch('http://localhost:9000/recipes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRecipes(data);
    } catch (err) {
      console.error('Error fetching recipes:', err);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [token]);

  const handleConvertToDraft = async (id) => {
    if (!window.confirm('Convert this recipe to a draft? It will become editable again.')) return;

    try {
      const res = await fetch(`http://localhost:9000/recipes/${id}/convert-to-draft`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const updatedRecipe = await res.json();
        setRecipes(prev => 
          prev.map(r => 
            r._id === id ? { ...updatedRecipe } : r
          )
        );
      }
    } catch (err) {
      console.error('Error converting to draft:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;

    try {
      const res = await fetch(`http://localhost:9000/recipes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setRecipes(prev => prev.filter(r => r._id !== id));
        if (selectedRecipe?._id === id) setSelectedRecipe(null);
      }
    } catch (err) {
      console.error('Error deleting recipe:', err);
    }
  };

  const drafts = recipes.filter(r => r.isDraft);
  const published = recipes.filter(r => !r.isDraft);
  const visibleRecipes = viewingDrafts ? drafts : published;

  const filteredRecipes = visibleRecipes.filter(recipe => 
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (recipe.description && recipe.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCardClick = (recipe) => {
    if (recipe.isDraft) {
      navigate('/createrecipe', { state: { draft: recipe } });
    } else {
      setSelectedRecipe(recipe);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={controlsContainerStyle}>
        <div style={searchContainerStyle}>
          <FaSearch style={searchIconStyle} />
          <input
            type="text"
            placeholder="Search recipes"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>

        <div style={{display: 'flex', gap: '2rem'}}>
                

        <div style={buttonGroupStyle}>
          <button
            onClick={() => setViewingDrafts(false)}
            style={{
              ...tabButtonStyle,
              fontWeight: !viewingDrafts ? 'bold' : 'normal',
              backgroundColor: !viewingDrafts ? 'rgba(0, 0, 0, 0.2)' : '#fff'
            }}
          >
            Published ({published.length})
          </button>
          <button
            onClick={() => setViewingDrafts(true)}
            disabled={drafts.length === 0}
            style={{
              ...tabButtonStyle,
              fontWeight: viewingDrafts ? 'bold' : 'normal',
              backgroundColor: viewingDrafts ? 'rgba(0, 0, 0, 0.2)' : '#fff',
              opacity: drafts.length === 0 ? 0.5 : 1
            }}
          >
            Drafts ({drafts.length})
          </button>
        </div>

        <button
          onClick={() => navigate('/createrecipe')}
          style={createButtonStyle}
        >
          + Create Recipe
        </button>
        </div>
      </div>
      

      {filteredRecipes.length === 0 ? (
        <p style={emptyStyle}>
          No {viewingDrafts ? 'draft' : 'published'} recipes found.
        </p>
      ) : (
        <div style={cardsContainerStyle}>
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              onCardClick={() => handleCardClick(recipe)}
              onDelete={handleDelete}
              showDeleteButton={setSelectedRecipe}
              onConvertToDraft={!recipe.isDraft ? () => handleConvertToDraft(recipe._id) : null}
            />
          ))}
        </div>
      )}

      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          isOpen={!!selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
};

const containerStyle = {
  padding: '1.5rem',
  margin: 'auto',
};

const controlsContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between', // This will maximize the gap
  alignItems: 'center',
  flexWrap: 'wrap', // Optional: only needed if wrapping is expected
  marginBottom: '20px',
  width: '100%', // Ensure the container takes full width
};

const searchContainerStyle = {
  position: 'relative',
  width: '300px'
};

const searchIconStyle = {
  position: 'absolute',
  left: '10px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#999'
};

const searchInputStyle = {
  width: '100%',
  padding: '8px 10px 8px 35px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '14px'
};

const buttonGroupStyle = {
  display: 'flex',
  gap: '10px'
};

const tabButtonStyle = {
  padding: '8px 12px',
  border: '1px solid #ccc',
  borderRadius: '25px',
  cursor: 'pointer',
  fontSize: '14px'
};

const createButtonStyle = {
  backgroundColor: '#4285f4',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  padding: '9px 20px',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '14px'
};

const emptyStyle = {
  textAlign: 'center',
  fontSize: '1.1rem',
  color: '#666',
  marginTop: '2rem'
};

const cardsContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  flexWrap: 'wrap',
  gap: '1rem',
  transform: 'scale(0.78)',
  transformOrigin: 'top center'
};

export default RecipeList;