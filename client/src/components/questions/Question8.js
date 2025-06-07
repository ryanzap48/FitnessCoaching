import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionLayout from './QuestionLayout';
import { useUser } from '../../contexts/UserContext'; // if you're using context


export default function Question8() {
  const navigate = useNavigate();

  const { userAnswers, updateAnswer } = useUser(); // optional: only if you're saving answers globally
  
  const [exercise, setExercise] = useState(userAnswers.exercise ?? '');  

  useEffect(() => {
      updateAnswer('exercise', exercise);
    }, [exercise, updateAnswer]);
  
  useEffect(() => {
      console.log("User Answers updated:", userAnswers);
      }, [userAnswers]);

  const handleNext = () => {
    navigate('/question9');
  };

  const options = [0, 1, 2, 3, 4, 5, 6, 7];

  return (
     <QuestionLayout step={8} onContinue={handleNext}>
      <h1>Current Exercise Frequency</h1>
      <h4>Weekly</h4>

      <div style={{ textAlign: 'left', marginTop: '2rem', marginLeft: '1rem'}}>
        {options.map((option) => (
          <label key={option} style={{ display: 'block', marginBottom: '0.5rem', fontSize: '1.05rem' }}>
            <input
              type="radio"
              name="exercise"
              value={option}
              checked={exercise === option}
              onChange={() => setExercise(option)}
              style={{ marginRight: '1.5rem' }}
            />
            {option} {option === 1 ? 'day' : 'days'}
          </label>
        ))}
      </div>
    </QuestionLayout>
  );
}
