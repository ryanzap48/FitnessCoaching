import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionLayout from './QuestionLayout';
import { useUser } from '../../contexts/UserContext'; // if you're using context


export default function Question4() {
  const navigate = useNavigate();

  const { userAnswers, updateAnswer } = useUser(); // optional: only if you're saving answers globally
  
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');


  useEffect(() => {
    const f = parseFloat(feet) || 0;
    const i = parseFloat(inches) || 0;
    const totalInches = f * 12 + i;
    const cm = totalInches * 2.54;
    updateAnswer('height', Math.round(cm * 1000)/1000); // Save rounded cm value
  }, [feet, inches, updateAnswer]);
  
  useEffect(() => {
  if (userAnswers.height) {
    const totalInches = userAnswers.height / 2.54;
    const savedFeet = Math.floor(totalInches / 12);
    const savedInches = Math.round(totalInches % 12);
    setFeet(savedFeet.toString());
    setInches(savedInches.toString());
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);



  useEffect(() => {
      console.log("User Answers updated:", userAnswers);
      }, [userAnswers]);

  const handleNext = () => {
    navigate('/question5');
  };

  return  (
    <QuestionLayout step={4} onContinue={handleNext}>
      <h1>How tall are you?</h1>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8rem', gap: '2rem' }}>
        {/* Feet Dropdown */}
        <div style={{ position: 'relative', width: '60px' }}>
          <select
            id="feet"
            value={feet}
            onChange={(e) => setFeet(e.target.value)}
            style={{
              appearance: 'none',
              background: 'transparent',
              border: 'none',
              borderBottom: '2px solid #1a1a1a',
              fontSize: '1.2rem',
              padding: '0.5rem 0',
              width: '100%',
              textAlign: 'center',
              color: feet ? '#000' : '#aaa',
              cursor: 'pointer',
            }}
          >
            <option value="" disabled hidden>ft</option>
            {[4, 5, 6].map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <div style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: '#1a1a1a',
            fontSize: '1rem',
          }}>▼</div>
        </div>

        {/* Inches Dropdown */}
        <div style={{ position: 'relative', width: '60px' }}>
          <select
            id="inches"
            value={inches}
            onChange={(e) => setInches(e.target.value)}
            style={{
              appearance: 'none',
              background: 'transparent',
              border: 'none',
              borderBottom: '2px solid #1a1a1a',
              fontSize: '1.2rem',
              padding: '0.5rem 0',
              width: '100%',
              textAlign: 'center',
              color: inches ? '#000' : '#aaa',
              cursor: 'pointer',
            }}
          >
            <option value="" disabled hidden>in</option>
            {[...Array(12)].map((_, i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
          <div style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: '#1a1a1a',
            fontSize: '1rem',
          }}>▼</div>
        </div>
      </div>
    </QuestionLayout>
  );
}