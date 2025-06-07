import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionLayout from './QuestionLayout';
import { useUser } from '../../contexts/UserContext'; // if you're using context


export default function Question10() {
  const navigate = useNavigate();

  const { userAnswers, updateAnswer } = useUser(); // optional: only if you're saving answers globally
  
  const [equipment, setEquipment] = useState(userAnswers.equipment || '');  

  useEffect(() => {
      updateAnswer('equipment', equipment);
    }, [equipment, updateAnswer]);

    
  
  useEffect(() => {
      console.log("User Answers updated:", userAnswers);
      }, [userAnswers]);

  const handleNext = () => {
    navigate('/question11');
  };

  const options = ['No Equipment', 'Dumbbells', 'Full gym'];

  return (
     <QuestionLayout step={10} onContinue={handleNext}>
      <h1>What equipment do you have?</h1>

      <div style={{ textAlign: 'left', marginTop: '3.85rem', marginLeft: '1rem'}}>
        {options.map((option) => (
          <label key={option} style={{ display: 'block', marginBottom: '0.5rem', fontSize: '1.05rem' }}>
            <input
              type="radio"
              name="equipment"
              value={option}
              checked={equipment === option}
              onChange={() => setEquipment(option)}
              style={{ marginRight: '1.5rem' }}
            />
            {option}
          </label>
        ))}
      </div>
    </QuestionLayout>
  );
}
