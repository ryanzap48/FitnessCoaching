import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';

export default function Finish() {
  const navigate = useNavigate();
  const { userAnswers, updateAnswer, resetAnswers } = useUser();
  const [message, setMessage] = useState('');
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName:  '',
    email:     '',
    phone:     '',
    password:  '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    updateAnswer(name, value);
    updateAnswer('createdAt', Date.now);
  };

  useEffect(() => {
      console.log("User Answers updated:", userAnswers);
      }, [userAnswers]);



  const handleRegister = (e) => {
    e.preventDefault();
    setMessage('');
    if (!userAnswers.firstName || !userAnswers.lastName) {
      setMessage("Please enter both first and last name.");
      return;
    }
    
    fetch('http://localhost:9000/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userAnswers),
  }).then((res) => {
      return res.json();
    })
    .then(() => {
      return fetch('http://localhost:9000/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userAnswers.email,
          password: userAnswers.password,
        }),
      });
    })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log('User role:', data?.user?.role);
      login(data.token, data.user.role);
      resetAnswers();
    })
  };

  useEffect(() => {
    if (Object.keys(userAnswers).length === 0) {
        navigate('/');
    }
    }, [userAnswers, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.blurBackground} />
      <div style={styles.modal}>
        <h2 style={styles.title}>You're All Set!</h2>
        <p style={styles.subtitle}>Enter your info to register.</p>

        <div style={styles.form}>
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            style={styles.input}
          />

          {/* Password with show/hide eye */}
          <div style={styles.inputWrapper}>
            <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
            />
            <span style={styles.eyeIcon} onClick={() => setShowPassword(prev => !prev)}>
                {showPassword ? '🙈' : '👁️'}
            </span>
            </div>
        </div>

        <button style={styles.button} onClick={handleRegister}>
          Register
        </button>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    inset: 0,
    zIndex: 999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(5px)',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  blurBackground: {
    position: 'absolute',
    inset: 0,
  },
  modal: {
    position: 'relative',
    zIndex: 1000,
    background: '#fff',
    borderRadius: '12px',
    padding: '2.5rem 2rem',
    maxWidth: '400px',
    width: '80%',
    textAlign: 'center',
    boxShadow: '0 15px 35px rgba(0,0,0,0.25)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    marginBottom: '0rem',
    fontSize: '1.75rem',
  },
  subtitle: {
    marginBottom: '1.5rem',
    color: '#555',
    fontSize: '1rem',
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '0rem',
  },
  input: {
  width: '100%',
  maxWidth: '350px',
  padding: '0.75rem',
  paddingRight: '2.5rem',  // Add space for the eye icon
  marginBottom: '1rem',
  borderRadius: '8px',
  border: '1px solid #ccc',
  fontSize: '1rem',
  boxSizing: 'border-box', // Ensure padding doesn't increase size
},

inputWrapper: {
  width: '100%',
  maxWidth: '350px',
  position: 'relative',
  marginBottom: '1rem',
},

eyeIcon: {
  position: 'absolute',
  top: '50%',
  right: '0.75rem',
  transform: 'translateY(-78%)',
  fontSize: '1.2rem',
  cursor: 'pointer',
  color: '#666',
  userSelect: 'none',
},
    
button: {
    background: 'linear-gradient(to right, rgb(85,77,77), #000)',
    color: '#fff',
    fontWeight: 600,
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '999px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
};
