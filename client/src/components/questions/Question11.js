import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionLayout from './QuestionLayout';
import { useUser } from '../../contexts/UserContext'; // if you're using context


export default function Question11() {
  const navigate = useNavigate();

  const { userAnswers, updateAnswer } = useUser(); // optional: only if you're saving answers globally
  
  const isComplete = Object.keys(userAnswers).length >= 11 &&
    Object.values(userAnswers).every(value =>
      value !== '' && !(Array.isArray(value) && value.length === 0)
    );;

  const [coachStyle, setCoachStyle] = useState(userAnswers.coachStyle || '');  

  useEffect(() => {
      updateAnswer('coachStyle', coachStyle);
    }, [coachStyle, updateAnswer]);
  
  useEffect(() => {
      console.log("User Answers updated:", userAnswers);
      }, [userAnswers]);

  const handleFinish = () => {
    if (!isComplete) {
      alert("Please complete all questions before finishing.");
      return;
    }
    navigate('/finish');
  };

  const options = [
    {
      label: 'The Drill Sergeant',
      value: 'The Drill Sergeant',
      description: 'Someone to push and hold me accountable.',
    },
    {
      label: 'The Partner',
      value: 'The Partner',
      description: 'Someone who supports and motivates with positive reinforcement.',
    },
    {
      label: 'Mix of both',
      value: 'Mix of both',
      description: 'Someone who will both push and support.',
    },
  ];
   return (
    <QuestionLayout step={11} onContinue={handleFinish} buttonLabel="Finish">
      <h1>Ideal Coaching Style</h1>

      <div style={{ textAlign: 'left', marginTop: '3.85rem', marginLeft: '1rem', marginRight: '1rem' }}>
        {options.map(({ label, value, description }) => (
          <label
            key={value}
            style={{
              display: 'block',
              marginBottom: '1.5rem',
              cursor: 'pointer',
            }}
          >
            <input
              type="radio"
              name="coachStyle"
              value={value}
              checked={coachStyle === value}
              onChange={() => setCoachStyle(value)}
              style={{ marginRight: '0.75rem' }}
            />
            <span style={{ fontSize: '1.05rem' }}>{label}</span>
            <div style={{ fontSize: '0.95rem', color: '#666', marginLeft: '1.75rem', marginTop: '0.25rem' }}>
              {description}
            </div>
          </label>
        ))}
      </div>
    </QuestionLayout>
  );
}