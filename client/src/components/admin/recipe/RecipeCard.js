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
  onConvertToDraft,
  scale = 1 // New scale prop with default value of 1
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

  // Calculate scaled dimensions
  const scaledWidth = 320 * scale;
  const scaledHeight = 420 * scale;
  const scaledImageWidth = 300 * scale;
  const scaledImageHeight = 300 * scale;
  const scaledFontSize = 22 * scale;

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        border: '1px solid #ccc',
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
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
            top: `${5 * scale}px`,
            right: `${8 * scale}px`,
            width: `${30 * scale}px`,
            height: `${30 * scale}px`,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            cursor: recipes.length > 1 ? 'pointer' : 'not-allowed',
            fontSize: `${20 * scale}px`,
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
            top: `${5 * scale}px`,
            left: `${8 * scale}px`,
            width: `${30 * scale}px`,
            height: `${30 * scale}px`,
            backgroundColor: 'rgba(255, 255, 255)',
            cursor: recipes.length > 1 ? 'pointer' : 'not-allowed',
            fontSize: `${20 * scale}px`,
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

      <div style={{ 
        display: 'flex', 
        gap: `${40 * scale}px`, 
        marginTop: `${10 * scale}px`, 
        marginBottom: `${10 * scale}px`
      }}>
        <h4 style={{ margin: 0, fontSize: `${16 * scale}px` }}>{recipe.category} </h4> •
        <h4 style={{ margin: 0, fontSize: `${16 * scale}px` }}>{recipe.calories} cals</h4>
      </div>

      <img
        src={recipe.imageUrl}
        alt='recipe'
        style={{ 
          width: `${scaledImageWidth}px`, 
          height: `${scaledImageHeight}px`, 
          cursor: 'pointer', 
          borderRadius: '8px' 
        }}
      />
      
      <h4 style={{ 
        fontFamily: 'Open Sans, sans-serif', 
        marginTop: `${10 * scale}px`, 
        marginBottom: '0px', 
        fontWeight: '100', 
        fontSize: `${scaledFontSize}px`
      }}>
        {recipe.name}
      </h4>
      
      <div style={{ 
        display: 'flex', 
        gap: `${10 * scale}px`, 
        marginTop: `${10 * scale}px`, 
        marginBottom: `${10 * scale}px`
      }}>
        <h4 style={{ margin: 0, fontWeight: '100', fontSize: `${14 * scale}px` }}>{recipe.calories} cals</h4>•
        <h4 style={{ margin: 0, fontWeight: '100', fontSize: `${14 * scale}px` }}>P{recipe.protein} g</h4>•
        <h4 style={{ margin: 0, fontWeight: '100', fontSize: `${14 * scale}px` }}>C{recipe.carbs} g</h4>•
        <h4 style={{ margin: 0, fontWeight: '100', fontSize: `${14 * scale}px` }}>F{recipe.fats} g</h4>
      </div>

      {/* Delete Button - Bottom Right */}
      {showDeleteButton && (
        <img
          src={deleteButton}
          alt='delete'
          style={{ 
            position: 'absolute', 
            bottom: `${8 * scale}px`, 
            right: `${8 * scale}px`, 
            width: `${20 * scale}px`, 
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
              top: `${8 * scale}px`, 
              right: `${8 * scale}px`, 
              width: `${20 * scale}px`, 
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