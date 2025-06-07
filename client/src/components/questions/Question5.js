import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionLayout from './QuestionLayout';
import { useUser } from '../../contexts/UserContext'; // if you're using context


export default function Question5() {
  const navigate = useNavigate();

  const { userAnswers, updateAnswer } = useUser(); // optional: only if you're saving answers globally
  
  const [pounds, setPounds] = useState(
    userAnswers.weight ? String((userAnswers.weight / 0.45359237).toFixed(0)) : ''
  );

  useEffect(() => {
  const poundsNum = parseInt(pounds, 10);
  if (!isNaN(poundsNum) && poundsNum > 99 && poundsNum < 501) {
    const kg = poundsNum * 0.45359237;
    updateAnswer('weight', Math.round(kg * 100) / 100); // Save as kg
  }
}, [pounds, updateAnswer]);
  
  useEffect(() => {
      console.log("User Answers updated:", userAnswers);
      }, [userAnswers]);

  const handleNext = () => {
    const poundsNum = parseInt(pounds, 10);
    if (poundsNum < 100 || poundsNum > 500) {
      alert("Please enter a valid weight between 100 and 500  lbs.");
      return;
    }
    navigate('/question6');
  };

  return (
     <QuestionLayout step={5} onContinue={handleNext}>
      <h1>What is your CURRENT weight?</h1>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #ccc',
          width: '90%',              // make it responsive
          maxWidth: '400px',         // optional: limit on large screens
          margin: '8rem auto 0 auto' // top margin only
        }}
      >
        <input
          type="text"
          inputMode="numeric"
          value={pounds}
          onChange={(e) => {
            const input = e.target.value;
            // Only allow digits, up to 3 characters, not starting with multiple zeros
            if (/^\d{0,3}$/.test(input)) {
              if (input === '' || /^[1-9]\d{0,2}$/.test(input) || input === '0') {
                setPounds(input);
              }
            }
          }}
          placeholder="Weight"
          style={{
            border: 'none',
            outline: 'none',
            flex: 1,
            fontSize: '1.2rem',
            padding: '10px 0',
            backgroundColor: 'transparent',
            minWidth: 0               // fix overflow issue on very small screens
          }}
        />
        <span
          style={{
            marginLeft: '8px',
            fontSize: '1.2rem',
            fontWeight: '500',
            whiteSpace: 'nowrap'     // keep "lbs" on one line
          }}
        >
          lbs
        </span>
      </div>
    </QuestionLayout>
  );
}
