import editButton from '../../../assets/edit-button.png';
import deleteButton from '../../../assets/bin.png';

const RecipeCard = ({ 
  recipe, 
  onCardClick, 
  onEdit, 
  onDelete,
  showEditButton = true,
  showDeleteButton = true,
  customActions = null // For additional actions like "Add to Meal Plan"
}) => {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        border: '1px solid #ccc',
        width: '350px',
        height: '400px',
        cursor: 'pointer',
        flexDirection: 'column',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        background: '#fff',
        alignItems: 'center'
      }}
      onClick={() => onCardClick(recipe)}
    >
      {showEditButton && (
        <img
          src={editButton}
          alt='edit'
          style={{ 
            position: 'absolute', 
            top: '8px', 
            right: '8px', 
            width: '20px', 
            cursor: 'pointer' 
          }}
          onClick={(e) => { 
            e.stopPropagation(); 
            onEdit(recipe); 
          }}
        />
      )}
     
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
          width: '340px', 
          height: '280px', 
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

      {/* Custom Actions (like Add to Meal Plan button) */}
      {customActions && (
        <div style={{ 
          position: 'absolute', 
          bottom: '40px', 
          right: '8px' 
        }}>
          {customActions}
        </div>
      )}

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
    </div>
  );
};

export default RecipeCard;