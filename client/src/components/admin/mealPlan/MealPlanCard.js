import deleteButton from '../../../assets/bin.png';
import draftButton from '../../../assets/edit-button.png';

const MealPlanCard = ({ 
  mealPlan, 
  onCardClick, 
  onDelete,
  onEdit,
  onConvertToDraft
 
}) => {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width: '267px',
        height: '300px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        background: '#fff',
        alignItems: 'center',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
      onClick={() => onCardClick(mealPlan._id)}
    >

      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: '185px', 
        
        overflow: 'hidden' 
        }}>
            <img
                src={mealPlan.imageUrl || null}
                alt='Meal Plan'
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
                />
                <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    
                }}>
                    {mealPlan.duration} weeks
                
                </div>
                {!mealPlan.isDraft && (
                    <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: 'calc(8px + 70px)', // Adjust based on duration bubble width
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'rgba(74, 222, 128, 0.9)',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                    }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(74, 222, 128, 0.9)',
                    }}></div>
                    Active
                    </div>
                )}
                
            
        </div>
      
      <h4 style={{ 
        fontFamily: 'Open Sans, sans-serif', 
        marginTop: '10px', 
        marginBottom: '0px', 
        fontWeight: '100', 
        fontSize: '20px'
      }}>
        {mealPlan.name}
      </h4>
      
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginTop: '7px', 
        marginBottom: '10px'
      }}>
        <h4 style={{ margin: 0, fontWeight: '100', fontSize: '13px' }}>{mealPlan.calories} cals</h4> 
        <h4 style={{ margin: 0, fontWeight: '100', fontSize: '13px' }}>{mealPlan.proteinPercent}%P /</h4>
        <h4 style={{ margin: 0, fontWeight: '100', fontSize: '13px' }}>{mealPlan.carbPercent}%C /</h4>
        <h4 style={{ margin: 0, fontWeight: '100', fontSize: '13px' }}>{mealPlan.fatPercent}%F</h4>
      </div>
      <div style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                padding: '4px 8px',
                fontSize: '14px',
                fontWeight: '500',
            }}>
                Assigned to <span style={{ fontWeight: '700' }} 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    onEdit(mealPlan); 
                  }}>
                  {mealPlan.assignedTo.length || 0} {mealPlan.assignedTo.length === 1 ? 'client' : 'clients'} </span>

        </div>
     
        <img
          src={deleteButton}
          alt='delete'
          style={{ 
            position: 'absolute', 
            bottom: '8px', 
            right: '8px', 
            width: '17px', 
            cursor: 'pointer' 
          }}
          onClick={(e) => { 
            e.stopPropagation(); 
            onDelete(mealPlan._id); 
          }}
        />

        

        <img
            src={draftButton}
            alt='convert to draft'
            style={{ 
                position: 'absolute', 
                bottom: '8px', 
                right: '38px', 
                width: '17px', 
                cursor: mealPlan.isDraft ? 'not-allowed' : 'pointer',
                opacity: mealPlan.isDraft ? 0.5 : 1,
                filter: mealPlan.isDraft ? 'grayscale(100%)' : 'none'
            }}
            onClick={(e) => { 
                if (mealPlan.isDraft) return; // Prevent action if already draft
                e.stopPropagation(); 
                onConvertToDraft(mealPlan._id);
            }}
            />
    </div>
  );
};

export default MealPlanCard;