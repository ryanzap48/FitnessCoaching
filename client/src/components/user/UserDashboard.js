import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function UserDashboard() {
  const { token } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [nutritionPlans, setNutritionPlans] = useState([]);
  const [ userData, setUserData ] = useState([]);



  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch ('http://localhost:9000/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const myData = await userRes.json();
        setUserData(myData);
        
        const workoutRes = await fetch('http://localhost:9000/workouts/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const workoutData = await workoutRes.json();
        setWorkouts(workoutData);

        const nutritionRes = await fetch('http://localhost:9000/mealplans/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const nutritionData = await nutritionRes.json();
        setNutritionPlans(nutritionData);
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };

    fetchData();
  }, [token]);



  
  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Welcome back, {userData?.firstName}!</h2>
     

      <div style={gridStyle}>
        <Link to="/myworkouts" style={cardLinkStyle}>
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>My Workouts</h3>
            <p style={cardCountStyle}>{workouts.length} workout{workouts.length !== 1 ? 's' : ''}</p>
          </div>
        </Link>

        <Link to="/mynutrition" style={cardLinkStyle}>
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>My Nutrition</h3>
            <p style={cardCountStyle}>{nutritionPlans.length} plan{nutritionPlans.length !== 1 ? 's' : ''}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

// Styles

const containerStyle = {
  padding: '2rem',
  maxWidth: '800px',
  margin: 'auto',
};

const headerStyle = {
  fontSize: '1.8rem',
  marginBottom: '0.5rem',
};

const gridStyle = {
  display: 'flex',
  gap: '2rem',
  flexWrap: 'wrap',
  justifyContent: 'center',
  marginTop: '3rem'
};

const cardLinkStyle = {
  textDecoration: 'none',
  color: 'inherit',
};

const cardStyle = {
  flex: '1 1 250px',
  padding: '1.5rem',
  borderRadius: '10px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  background: 'linear-gradient(to right, #444, #222)',
  color: '#fff',
  textAlign: 'center',
  transition: 'transform 0.2s',
};

const cardTitleStyle = {
  fontSize: '1.2rem',
  marginBottom: '0.5rem',
};

const cardCountStyle = {
  fontSize: '1.6rem',
  fontWeight: 'bold',
};

