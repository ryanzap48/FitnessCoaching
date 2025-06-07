import React from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionLayout from './QuestionLayout';
import image1 from '../../assets/image1.png';

export default function Question0() {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate('/question1');
  };

  return (
    <QuestionLayout step={0} onContinue={handleNext}>
      <h1>Answer a few questions to let me know more about you</h1>
      <img 
          src={image1} 
          alt="Welcome illustration"
          style={{ 
            margin: '2rem auto', 
            display: 'block', 
            width: '60%', 
            minWidth: '200px'
          
          }}
        />
      {/* Add input/select options here */}
    </QuestionLayout>
  );
}
