import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionLayout from './QuestionLayout';
import { useUser } from '../../contexts/UserContext'; // if you're using context


export default function Question2() {
  const navigate = useNavigate();

  const { userAnswers, updateAnswer } = useUser(); // optional: only if you're saving answers globally
  
  const [age, setAge] = useState(userAnswers.age || '');  

  useEffect(() => {
    if (age !== '' && parseInt(age) > 17 && parseInt(age) < 81) {
      updateAnswer('age', parseInt(age));
    }
    }, [age, updateAnswer]);
  
  useEffect(() => {
      console.log("User Answers updated:", userAnswers);
      }, [userAnswers]);

  const handleNext = () => {
    const ageNum = parseInt(age);
    if (ageNum < 18 || ageNum > 80) {
      alert("Please enter a valid age between 18 and 80 yrs.");
      return;
    }

    navigate('/question3');
  };

  return (
     <QuestionLayout step={2} onContinue={handleNext}>
      <h1>How old are you?</h1>

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
          value={age}
          onChange={(e) => {
            const input = e.target.value;

            // Only allow up to 2 digits, no leading zeros (unless input is empty)
            if (/^\d{0,2}$/.test(input)) {
              if (input === '' || (/^[1-9]\d?$/.test(input) || input === '0')) {
                setAge(input);
              }
            }
          }}
          placeholder="Age"
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
            whiteSpace: 'nowrap'     // keep "yrs" on one line
          }}
        >
          yrs
        </span>
      </div>
    </QuestionLayout>
  );
}
