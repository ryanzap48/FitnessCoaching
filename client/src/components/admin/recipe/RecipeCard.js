import deleteButton from '../../../assets/bin.png';
import draftButton from '../../../assets/edit-button.png';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';


const RecipeCard = ({ 
  recipe, 
  onCardClick, 
  onDelete,
  showDeleteButton,
  onSwitch,
  onSwitchPrev,
  recipes = [],
  currentIndex = 0,
  day,
  category,
  onConvertToDraft
}) => {
  
  const cycleToNextRecipe = (day, category) => {
    if (onSwitch) {
      onSwitch(day, category);
    }
  };

  const cycleToPrevRecipe = (day, category) => {
    if (onSwitchPrev) {
      onSwitchPrev(day, category);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        border: '1px solid #ccc',
        width: '320px',
        height: '420px',
        cursor: 'pointer',
        flexDirection: 'column',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        background: '#fff',
        alignItems: 'center'
      }}
      onClick={() => onCardClick(recipe)}
    >
      {/* Switch Button - Top Left */}
      {onSwitch && (
        <>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click
            cycleToNextRecipe(day, category);
          }}
          disabled={recipes.length <= 1}
          style={{
            position: 'absolute',
            top: '5px',
            right: '8px', // Changed from right to left
            width: '30px',
            height: '30px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            cursor: recipes.length > 1 ? 'pointer' : 'not-allowed',
            fontSize: '20px',
            display: 'flex',
            border: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: recipes.length > 1 ? 1 : 0.5,
            transition: 'all 0.2s ease',
            zIndex: 10
          }}
          title={recipes.length > 1 ? `Switch recipe (${currentIndex + 1} of ${recipes.length})` : 'Only one recipe available'}
          onMouseEnter={(e) => {
            if (recipes.length > 1) {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 1)';
            }
          }}
          onMouseLeave={(e) => {
            if (recipes.length > 1) {
              e.target.style.transform = 'scale(1)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            }
          }}
        >
          <FiChevronRight /> 
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click
            cycleToPrevRecipe(day, category);
          }}
          disabled={recipes.length <= 1}
          style={{
            position: 'absolute',
            top: '5px',
            left: '8px', // Changed from right to left
            width: '30px',
            height: '30px',
            backgroundColor: 'rgba(255, 255, 255)',
            cursor: recipes.length > 1 ? 'pointer' : 'not-allowed',
            fontSize: '20px',
            display: 'flex',
            border: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: recipes.length > 1 ? 1 : 0.5,
            transition: 'all 0.2s ease',
            zIndex: 10
          }}
          title={recipes.length > 1 ? `Switch recipe (${currentIndex + 1} of ${recipes.length})` : 'Only one recipe available'}
          onMouseEnter={(e) => {
            if (recipes.length > 1) {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 1)';
            }
          }}
          onMouseLeave={(e) => {
            if (recipes.length > 1) {
              e.target.style.transform = 'scale(1)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            }
          }}
        >
          <FiChevronLeft />
        </button>
        </>
      )}

      {/* Your existing content - removed empty div */}
  
      <div style={{ 
        display: 'flex', 
        gap: '40px', 
        marginTop: '10px', 
        marginBottom: '10px'
      }}>
        <h4 style={{ margin: 0 }}>{recipe.category} </h4> •
        <h4 style={{ margin: 0 }}>{recipe.calories} cals</h4>
      </div>

      <img
        src={recipe.imageUrl}
        alt='recipe'
        style={{ 
          width: '300px', 
          height: '300px', 
          cursor: 'pointer', 
          borderRadius: '8px' 
        }}
      />
      
      <h4 style={{ 
        fontFamily: 'Open Sans, sans-serif', 
        marginTop: '10px', 
        marginBottom: '0px', 
        fontWeight: '100', 
        fontSize: '22px'
      }}>
        {recipe.name}
      </h4>
      
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginTop: '10px', 
        marginBottom: '10px'
      }}>
        <h4 style={{ margin: 0, fontWeight: '100' }}>{recipe.calories} cals</h4>•
        <h4 style={{ margin: 0, fontWeight: '100' }}>P{recipe.protein} g</h4>•
        <h4 style={{ margin: 0, fontWeight: '100' }}>C{recipe.carbs} g</h4>•
        <h4 style={{ margin: 0, fontWeight: '100' }}>F{recipe.fats} g</h4>
      </div>

      {/* Delete Button - Bottom Right */}
      {showDeleteButton && (
        <img
          src={deleteButton}
          alt='delete'
          style={{ 
            position: 'absolute', 
            bottom: '8px', 
            right: '8px', 
            width: '20px', 
            cursor: 'pointer' 
          }}
          onClick={(e) => { 
            e.stopPropagation(); 
            onDelete(recipe._id); 
          }}
        />
      )}
      <img
          src={draftButton}
          alt='convert to draft'
          style={{ 
              position: 'absolute', 
              top: '8px', 
              right: '8px', 
              width: '20px', 
              cursor: recipe.isDraft ? 'not-allowed' : 'pointer',
              opacity: recipe.isDraft ? 0.5 : 1,
              filter: recipe.isDraft ? 'grayscale(100%)' : 'none'
          }}
          onClick={(e) => { 
              if (recipe.isDraft) return; // Prevent action if already draft
              e.stopPropagation(); 
              onConvertToDraft(recipe._id);
          }}
          />
    </div>
  );
};

export default RecipeCard;