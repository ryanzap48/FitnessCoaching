import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionLayout from './QuestionLayout';
import { useUser } from '../../contexts/UserContext'; // if you're using context


export default function Question1() {
  const navigate = useNavigate();

  const { userAnswers, updateAnswer } = useUser(); // optional: only if you're saving answers globally

  const [selectedGoals, setSelectedGoals] = useState(userAnswers.fitnessGoals || []);

  const goals = [
    'Lose Weight',
    'Tone Muscle',
    'Build Muscle',
    'Build Strength',
    'Improve Nutrition',
    'Other'
  ];

  useEffect(() => {
      console.log("User Answers updated:", userAnswers);
      }, [userAnswers]);
   // Update context when selection changes


  useEffect(() => {
    updateAnswer('fitnessGoals', selectedGoals);
  }, [selectedGoals, updateAnswer]);


  const handleToggle = (goal) => {
    setSelectedGoals(prev =>
      prev.includes(goal)
        ? prev.filter(item => item !== goal) // uncheck
        : [...prev, goal] // check
    );
  };

  
  const handleNext = () => {
    navigate('/question2');
  };

  return (
    <QuestionLayout step={1} onContinue={handleNext}>
      <h1>What are your fitness goals</h1>
      <h4>select all that apply</h4>
      
    
      <div style={{ textAlign: 'left', marginTop: '2rem', marginLeft: '1rem' }}>
        {goals.map((goal) => (
          <label key={goal} style={{ display: 'block', marginBottom: '0.5rem', fontSize: '1.05rem' }}>
            <input
              type="checkbox"
              value={goal}
              checked={selectedGoals.includes(goal)}
              onChange={() => handleToggle(goal)}
              style={{ marginRight: '1.5rem' }}
            />
            {goal}
          </label>
        ))}
      </div>

    </QuestionLayout>
  );
}
