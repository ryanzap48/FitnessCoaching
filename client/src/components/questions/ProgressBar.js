import '../../css/ProgressBar.css';

export default function ProgressBar({ step, totalSteps }) {
  const percentage = Math.min((step / totalSteps) * 100, 100).toFixed(0);

  return (
    <div className="progress-bar-container">
      <div className="progress-bar-background">
        <div
          className="progress-bar-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="progress-label">{percentage}%</span>
    </div>
  );
}
