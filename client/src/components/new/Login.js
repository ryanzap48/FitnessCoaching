import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  try {
    const res = await fetch('http://localhost:9000/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
   
    if (res.ok) {
      console.log('User role:', data?.user?.role);  // Optional chaining for safety
      login(data.token, data.user.role);
      if(data.user.role === 'admin') window.location.href = '/adminuserlist';
      else window.location.href = '/';

    } else {
      console.warn('Login failed:', data.message);
      setError(data.message || 'Login failed.');
    }
  } catch (err) {
    console.error('Network or parsing error:', err);
    setError('Something went wrong. Please try again.');
  }
};

  return (
    <div style={styles.container}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Welcome Back</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
          />
          <div style={styles.inputWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
            />
            <span onClick={() => setShowPassword(prev => !prev)} style={styles.eyeIcon}>
              {showPassword ? '🙈' : '👁️'}
            </span>
          </div>
            <div style={{ 
              ...styles.errorMessage, 
              opacity: error ? 1 : 0 
            }}>
              {error}
            </div>
          <button type="submit" id='login-button' style={styles.button}>Login</button>

          {/* New User Button */}
            <a href="/question0" style={styles.secondaryButton}>
            New User?
            </a>
        </form>
      </div>
    </div>
  );
}

const styles = {
  errorMessage: {
    minHeight: '1.25rem',  // Reserve space so layout doesn't shift
    color: 'crimson',
    fontSize: '0.9rem',
    marginBottom: '0.5rem',
    textAlign: 'center',
    transition: 'opacity 0.3s ease',
  },
  secondaryButton: {
    marginTop: '0.65rem',
    backgroundColor: 'ffffff',
    
    color: '#0f0f0f',
    fontSize: '15px',
    textAlign: 'center',
    border: 'none',
    textDecoration: 'none',
    fontWeight: 'bold',
    display: 'inline-block',
    },
container: {
    position: 'fixed',
    inset: 0,
    backdropFilter: 'blur(5px)',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
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
    maxHeight: '400px',
    
  },
  title: {
    marginBottom: '1rem',
    marginTop: '-0.90rem',
    fontSize: '1.8rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '0.75rem',
    paddingRight: '1rem',
    paddingLeft: '1rem',
    marginBottom: '.5rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    minWidth: '250px',
  },
inputWrapper: {
  width: '100%',
  position: 'relative',
},

eyeIcon: {
  position: 'absolute',
  top: '50%',
  right: '0.75rem',
  transform: 'translateY(-61%)',
  fontSize: '1.2rem',
  cursor: 'pointer',
  color: '#666',
  userSelect: 'none',
},
  button: {
    background: 'linear-gradient(90deg, #c2bfbf, #000000)',
    color: '#fff',
    fontWeight: 'bold',
    padding: '.75rem',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};
