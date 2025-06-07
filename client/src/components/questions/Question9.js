import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionLayout from './QuestionLayout';
import { useUser } from '../../contexts/UserContext'; // if you're using context


export default function Question9() {
  const navigate = useNavigate();

  const { userAnswers, updateAnswer } = useUser(); // optional: only if you're saving answers globally
  
  const [targetExercise, setTargetExercise] = useState(userAnswers.targetExercise || '');  

  useEffect(() => {
      updateAnswer('targetExercise', targetExercise);
    }, [targetExercise, updateAnswer]);
  
  useEffect(() => {
      console.log("User Answers updated:", userAnswers);
      }, [userAnswers]);

  const handleNext = () => {
    navigate('/question10');
  };

  const options = [0, 1, 2, 3, 4, 5, 6, 7];

  return (
     <QuestionLayout step={9} onContinue={handleNext}>
      <h1>Target Exercise Frequency</h1>
      <h4>Weekly</h4>

      <div style={{ textAlign: 'left', marginTop: '2rem', marginLeft: '1rem'}}>
        {options.map((option) => (
          <label key={option} style={{ display: 'block', marginBottom: '0.5rem', fontSize: '1.05rem' }}>
            <input
              type="radio"
              name="targetExercise"
              value={option}
              checked={targetExercise === option}
              onChange={() => setTargetExercise(option)}
              style={{ marginRight: '1.5rem' }}
            />
            {option} {option === 1 ? 'day' : 'days'}
          </label>
        ))}
      </div>
    </QuestionLayout>
  );
}
