import { useEffect, useState } from 'react';
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

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };
  // Validate email format
  const isValidEmail = (email) => {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;
    
    // List of valid TLDs (you can expand this list)
    const validTLDs = [
      'com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'co', 'io', 'me',
      'info', 'biz', 'name', 'pro', 'museum', 'aero', 'coop', 'jobs',
      'mobi', 'travel', 'tel', 'post', 'asia', 'cat', 'uk', 'ca', 'au',
      'de', 'fr', 'jp', 'cn', 'ru', 'br', 'mx', 'in', 'it', 'es', 'nl'
    ];
    
    // Extract TLD from email
    const tld = email.split('.').pop().toLowerCase();
    
    return validTLDs.includes(tld);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Apply 15 character limit to all fields
    if (name === 'phone' & value.length > 14) {
      return;
    }
    if (name !== 'email' & value.length > 15) {
      return;
    }
    if (name === 'email' & value.length > 30) {
      return;
    }

    let processedValue = value;
    let rawValue = value;

    // Special handling for phone number
    if (name === 'phone') {
      // Remove all non-digits for the raw value sent to backend
      rawValue = value.replace(/\D/g, '');
      // Format for display
      processedValue = formatPhoneNumber(value);
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));
    // Store raw value (especially important for phone)
    updateAnswer(name, name === 'phone' ? rawValue : processedValue);
    updateAnswer('createdAt', Date.now());
  };

  useEffect(() => {
      console.log("User Answers updated:", userAnswers);
      }, [userAnswers]);



  const handleRegister = (e) => {
    e.preventDefault();
    setMessage('');
    
    if (!userAnswers.firstName || !userAnswers.lastName || !userAnswers.email || !userAnswers.phone || !userAnswers.password) {
      setMessage("Please enter all required information.");
      return;
    }

    // Validate email format
    if (!isValidEmail(userAnswers.email)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    // Ensure phone has at least 10 digits
    if (userAnswers.phone.length < 10) {
      setMessage("Please enter a valid phone number.");
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
    .catch((error) => {
      console.error('Registration error:', error);
      setMessage("Registration failed. Please try again.");
    });
  };

  useEffect(() => {
    if (Object.keys(userAnswers).length === 0) {
        navigate('/');
    }
    }, [userAnswers, navigate]);

  // Helper function to get character count for display
  const getCharacterCount = (fieldName) => {
    const value = formData[fieldName] || '';
    if (fieldName === 'email'){
      return 30 - value.length
    }
    if (fieldName === 'phone'){
      return 14 - value.length
    }
    return 15 - value.length;
  };

  return (
    <div style={styles.container}>
      <div style={styles.blurBackground} />
      <div style={styles.modal}>
        <h2 style={styles.title}>You're All Set!</h2>
        <p style={styles.subtitle}>Enter your info to register.</p>

        <div style={styles.form}>
          <div style={styles.inputWrapper}>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              style={styles.input}
            />
            <span style={styles.characterCounter}>{getCharacterCount('firstName')}</span>
          </div>

          <div style={styles.inputWrapper}>
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              style={styles.input}
            />
            <span style={styles.characterCounter}>{getCharacterCount('lastName')}</span>
          </div>

          <div style={styles.inputWrapper}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              style={{
                ...styles.input,
                borderColor: formData.email && !isValidEmail(formData.email) ? '#ff4444' : '#ccc'
              }}
            />
            <span style={styles.characterCounter}>{getCharacterCount('email')}</span>
          </div>

          <div style={styles.inputWrapper}>
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              style={styles.input}
            />
            <span style={styles.characterCounter}>{getCharacterCount('phone')}</span>
          </div>

          <div style={styles.passwordWrapper}>
            <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                style={styles.passwordInput}
            />
            <span style={styles.eyeIcon} onClick={() => setShowPassword(prev => !prev)}>
                {showPassword ? '🙈' : '👁️'}
            </span>
            <span style={styles.passwordCounter}>{getCharacterCount('password')}</span>
          </div>
        </div>

        <button style={styles.button} onClick={handleRegister}>
          Register
        </button>
        {message && <p style={styles.errorMessage}>{message}</p>}
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
    marginBottom: '0.25rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  inputWrapper: {
    width: '100%',
    maxWidth: '350px',
    position: 'relative',
    marginBottom: '1rem',
  },
  passwordWrapper: {
    width: '100%',
    maxWidth: '350px',
    position: 'relative',
    marginBottom: '1rem',
  },
  passwordInput: {
    width: '100%',
    padding: '0.75rem',
    paddingRight: '2.5rem',
    marginBottom: '0.25rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  characterCounter: {
    position: 'absolute',
    bottom: '0.25rem',
    right: '0.5rem',
    fontSize: '0.75rem',
    color: '#999',
    pointerEvents: 'none',
  },
  passwordCounter: {
    position: 'absolute',
    bottom: '0.25rem',
    right: '0.5rem',
    fontSize: '0.75rem',
    color: '#999',
    pointerEvents: 'none',
  },
  eyeIcon: {
    position: 'absolute',
    top: '50%',
    right: '1.35rem',
    transform: 'translateY(-62%)',
    fontSize: '1.2rem',
    cursor: 'pointer',
    color: '#666',
    userSelect: 'none',
    zIndex: 1,
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
  errorMessage: {
    color: '#ff4444',
    fontSize: '0.875rem',
    marginTop: '1rem',
  },
};
