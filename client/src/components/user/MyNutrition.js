import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function MyNutrition() {
  const { token } = useAuth();
  const [mealplans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:9000/mealplans/my', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setMealPlans(data);
        
        // If user has exactly one meal plan, redirect to it
        if (data && data.length === 1) {
          navigate(`/mealplans/${data[0].name}`, { replace: true });
        } else {
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [token, navigate]);

  if (loading) {
    return (
      <div style={{ 
        padding: '1rem',
        textAlign: 'center',
      }}>
        <p style={{ 
          fontSize: '1.1rem',
          color: '#666',
          marginTop: '2rem'
        }}>
          <strong>Loading your mealplan... </strong>
        </p>
      </div>
    );
  }

  // If no meal plans
  if (mealplans.length === 0) {
    return (
      <div style={{ 
        padding: '1rem',
        textAlign: 'center'
      }}>
        <p style={{ 
          fontSize: '1.1rem',
          color: '#666',
          marginTop: '4rem'
        }}>
          No meal plans assigned yet.
        </p>
      </div>
    );
  }
}