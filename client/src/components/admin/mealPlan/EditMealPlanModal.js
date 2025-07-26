import { useState, useEffect } from 'react';

const EditMealPlanModal = ({ 
  mealPlan, 
  isOpen, 
  onClose, 
  onAssign, 
  onUnassign,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 568);
  const [assignEmail, setAssignEmail] = useState('');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 568);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset input when opening the modal or when meal plan changes
  useEffect(() => {
    if (isOpen) setAssignEmail('');
  }, [isOpen, mealPlan]);

  if (!isOpen || !mealPlan) return null;

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const modalStyle = {
    position: 'relative',
    background: 'rgb(228, 222, 222)',
    borderRadius: '10px',
    maxWidth: '600px',
    height: '40vh',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
    overflowY: 'auto',
  };

  return (
    <div style={overlayStyle}>
      <div style={{
        ...modalStyle,
        width: isMobile ? '95vw' : '400px',
        maxWidth: isMobile ? '95vw' : '600px',
        height: isMobile ? '40vh' : '40vh',
        padding: isMobile ? '15px' : '20px'
      }}>
        <button
          onClick={onClose}
          style={{ 
            float: 'right', 
            background: 'none', 
            border: 'none', 
            fontSize: '1.5rem' 
          }}
        >×</button>
        <h3>Manage Access: {mealPlan.name}</h3>

        <div style={{ marginBottom: '1rem' }}>
          <h4>Assigned Users</h4>
          <ul>
            {mealPlan.assignedTo.map((user, idx) => (
              <li key={idx} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '0.5rem' 
              }}>
                <span style={{ fontSize: isMobile ? '14px' : '16px' }}>
                  {user.email}
                </span>
                <button 
                  onClick={() => onUnassign(mealPlan._id, user.email)}
                  style={{ 
                    fontSize: isMobile ? '12px' : '14px', 
                    padding: isMobile ? '4px 8px' : '6px 12px' 
                  }}
                >
                  Unassign
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row', 
          gap: '10px' 
        }}>
          <input
            type="email"
            placeholder="Add user by email"
            value={assignEmail}
            onChange={(e) => setAssignEmail(e.target.value)}
            style={{ 
              flex: 1, 
              padding: isMobile ? '8px' : '10px',
              fontSize: isMobile ? '14px' : '16px'
            }}
          />
          <button 
            onClick={() => onAssign(mealPlan._id, assignEmail)}
            style={{ 
              padding: isMobile ? '8px 12px' : '10px 16px',
              fontSize: isMobile ? '14px' : '16px'
            }}
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMealPlanModal;
