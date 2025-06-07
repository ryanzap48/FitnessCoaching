import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionLayout from './QuestionLayout';
import { useUser } from '../../contexts/UserContext'; // if you're using context


export default function Question3() {
  const navigate = useNavigate();

  const { userAnswers, updateAnswer } = useUser(); // optional: only if you're saving answers globally
  
  const [gender, setGender] = useState(userAnswers.gender || '');  

  useEffect(() => {
      updateAnswer('gender', gender);
    }, [gender, updateAnswer]);
  
  useEffect(() => {
      console.log("User Answers updated:", userAnswers);
      }, [userAnswers]);

  const handleNext = () => {
    navigate('/question4');
  };

  const options = ['Female', 'Male', 'Prefer Not To Say', 'Other'];

  return (
     <QuestionLayout step={3} onContinue={handleNext}>
      <h1>How do you identify yourself?</h1>

      <div style={{ textAlign: 'left', marginTop: '3.85rem', marginLeft: '1rem'}}>
        {options.map((option) => (
          <label key={option} style={{ display: 'block', marginBottom: '0.5rem', fontSize: '1.05rem' }}>
            <input
              type="radio"
              name="gender"
              value={option}
              checked={gender === option}
              onChange={() => setGender(option)}
              style={{ marginRight: '1.5rem' }}
            />
            {option}
          </label>
        ))}
      </div>
    </QuestionLayout>
  );
}
