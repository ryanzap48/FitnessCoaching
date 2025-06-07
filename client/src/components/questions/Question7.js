import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionLayout from './QuestionLayout';
import { useUser } from '../../contexts/UserContext'; // if you're using context


export default function Question7() {
  const navigate = useNavigate();

  const { userAnswers, updateAnswer } = useUser(); // optional: only if you're saving answers globally
  
  const [experience, setExperience] = useState(userAnswers.experience || '');  

  useEffect(() => {
      updateAnswer('experience', experience);
    }, [experience, updateAnswer]);
  
  useEffect(() => {
      console.log("User Answers updated:", userAnswers);
      }, [userAnswers]);

  const handleNext = () => {
    navigate('/question8');
  };

  const options = [
    {
      label: 'Little Experience',
      value: 'Little Experience',
      description: 'I’m not familiar with many exercises or workouts.',
    },
    {
      label: 'Some Experience',
      value: 'Some Experience',
      description: 'I’m familiar with some exercises and workouts.',
    },
    {
      label: 'Heavy Experience',
      value: 'Heavy Experience',
      description: 'I’m very familiar with many exercises and workouts.',
    },
  ];
   return (
    <QuestionLayout step={7} onContinue={handleNext}>
      <h1>Describe Your Workout Experience</h1>

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
              name="experience"
              value={value}
              checked={experience === value}
              onChange={() => setExperience(value)}
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