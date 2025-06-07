import { useNavigate } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import '../../css/QuestionLayout.css';

export default function QuestionLayout({ children, step, onContinue, buttonLabel = 'Continue' }) {
  const navigate = useNavigate();
  
  return (
    <div className="question-container">
      <ProgressBar step={step} totalSteps={11} />

      <div className="question-box">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <span className="arrow">&lt;</span>
          <span className="back-text">Back</span>
        </button>
        {children}
      </div>

      <button className="continue-btn" onClick={onContinue}>
        {buttonLabel} →
      </button>
    </div>
  );
}