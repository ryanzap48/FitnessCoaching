import { useState } from 'react';

function InputLogModal({ isOpen, onClose, onSave }) {
  const [weight, setWeight] = useState('');
  const [sleep, setSleep] = useState('');

  const handleSave = () => {
    if (!weight && !sleep) return; // prevent empty submission
    onSave({ weight: weight ? parseFloat(weight) : null, sleep: sleep ? parseFloat(sleep) : null });
    setWeight('');
    setSleep('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h2>Log New Metrics</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <label>
            Weight (lbs):
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              style={inputStyle}
            />
          </label>
          <label>
            Sleep (hrs):
            <input
              type="number"
              value={sleep}
              onChange={(e) => setSleep(e.target.value)}
              style={inputStyle}
            />
          </label>
        </div>
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button onClick={onClose} style={buttonStyle}>Cancel</button>
          <button onClick={handleSave} style={{ ...buttonStyle, background: '#4285F4', color: '#fff' }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// Styles
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  background: '#fff',
  padding: '2rem',
  borderRadius: '12px',
  minWidth: '300px',
};

const inputStyle = {
  marginTop: '0.5rem',
  padding: '0.5rem',
  width: '100%',
  borderRadius: '6px',
  border: '1px solid #ccc',
};

const buttonStyle = {
  padding: '0.5rem 1rem',
  borderRadius: '6px',
  border: 'none',
  cursor: 'pointer',
};


export default InputLogModal;