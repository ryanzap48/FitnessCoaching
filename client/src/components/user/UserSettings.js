import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);


export default function UserSettings() {
  const { token, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState({
    phone: '',
    email: '',
    password: '',
    profilePicture: ''
  });

  const [editStates, setEditStates] = useState({
    email: false,
    phone: false,
    password: false
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const userRes = await fetch('http://localhost:9000/users/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const users = await userRes.json();

      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentUser = users.find(u => u.email === payload.email);

      setUserData(currentUser);
      setFormData({
        id: currentUser._id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        password: currentUser.password,
        phone: formatPhoneNumber(currentUser.phone || ''),
        profileColor: currentUser.profileColor,
        profilePicture : currentUser.profilePicture
      });
      console.log(currentUser.profilePicture);
      
      setLoading(false);
    };
    fetchData();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Apply character limits
    if (name === 'phone' && value.length > 14) {
      return;
    }
    if (name !== 'email' && name !== 'phone' && value.length > 15) {
      return;
    }
    if (name === 'email' && value.length > 30) {
      return;
    }

    let processedValue = value;

    // Special handling for phone number
    if (name === 'phone') {
      processedValue = formatPhoneNumber(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await fetch(`http://localhost:9000/users/${id}`, { method: 'DELETE' });
      logout();
    }
  };

 const showMessage = (field, msg) => {
  setMessages(prev => ({ ...prev, [field]: msg }));
  setTimeout(() => setMessages(prev => ({ ...prev, [field]: '' })), 1000);
};

// Field-specific validation
const validateField = (field, value) => {
  if (field === 'email' && !isValidEmail(value)) return 'Please enter a valid email address';
  if (field === 'phone') {
    const digits = value.replace(/\D/g, '');
    if (digits.length < 10) return 'Please enter a valid phone number';
  }
  return null;
};

const handleSave = async (field, file = null) => {
  try {
    let body;
    let headers = { Authorization: `Bearer ${token}` };

    if (file) {
      // Handle file uploads
      body = new FormData();
      body.append(field, file);
    } else {
      // Validate field
      const error = validateField(field, formData[field]);
      if (error) {
        showMessage(field, error); // show under the specific field
        return;
      }

      let valueToSave = formData[field];
      if (field === 'phone') valueToSave = valueToSave.replace(/\D/g, '');
      body = JSON.stringify({ [field]: valueToSave });
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`http://localhost:9000/users/${userData._id}`, {
      method: 'PATCH',
      headers,
      body
    });

    if (!res.ok) throw new Error('Update failed');

    const updated = await res.json();
    setUserData(updated);

    // Update formData locally
    setFormData(prev => ({ ...prev, [field]: file ? updated[field] : formData[field] }));
    if (!file) setEditStates(prev => ({ ...prev, [field]: false }));

    showMessage(field, `${field} saved successfully!`);
  } catch (error) {
    showMessage(field, `Failed to save ${field}`);
  }
};

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

  
  if (loading) return <p>Loading...</p>;

  const settingsConfig = {
    accountInfo: {
      icon: '👤',
      label: 'Account Info',
    },
    password: {
      icon: '🔒',
      label: 'Password',
    },
    accountControl: {
      icon: '🗑️',
      label: 'Account Control',
    },
  };

  const infoStyle = {
    padding: '10px 12px',
    border: '2px solid rgb(255, 255, 255)',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px'
  }

  

  return (
    <div style={{
      padding: '1.5rem',
      margin: 'auto',
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem'}}>
        <div style={{
          width: '25%',
          height: 'auto',
          background: 'linear-gradient(145deg,rgb(185, 175, 175), #dcdcdc)',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '8px'

        }}>
          {Object.entries(settingsConfig).map(([key]) => {
            return (
              <button
                key={key}
                onClick={() => {
                  const el = document.getElementById(key);
                  if (el) {
                    gsap.to(window, {
                      duration: 1,
                      scrollTo: { y: el, offsetY: 50 },
                      ease: "power2.inOut"
                    });
                  }
                }}
                style={{
                  background: 'none',
                  color: 'white',
                  padding: '0.75rem 1rem',
                  marginBottom: '0.5rem',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>{settingsConfig[key].icon}</span>
                <span>{settingsConfig[key].label}</span>
              </button>
            );
            
          })}

        </div>
        <div style={{
          width: '45%',
          height: 'auto',
          background: 'linear-gradient(145deg,rgb(212, 204, 204), #dcdcdc)',
          padding: '2rem',
          borderRadius: '8px'
        }}>
          <span style={{fontWeight: '700', fontSize: '21px'}}>Manage Account</span>
          <section
            id="accountInfo"
            style={{padding: '1rem 0.5rem'}}
            >
              <span style={{fontWeight: '400', fontSize: '15px'}}>Account Information</span>
            <div style={{ position: 'relative', width: '120px', height: '120px', paddingTop: '1rem' }}>
              {/* Profile Circle */}
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                backgroundColor: formData.profilePicture ? 'transparent' : formData.profileColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                fontSize: '2.5rem',
                color: '#fff',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
              }}>
                {formData.profilePicture ? (
                  <img
                    src={`http://localhost:9000${formData.profilePicture}`}
                    alt="Profile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  formData.firstName?.[0]?.toUpperCase() + formData.lastName?.[0]?.toUpperCase()
                )}
              </div>

              {/* Edit Icon Overlay */}
              <label htmlFor="profile-pic-input" style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                backgroundColor: '#007BFF',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
              }}>
                <span style={{ color: '#fff', fontSize: '16px' }}>✎</span>
                <input
                  id="profile-pic-input"
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={(e) => handleSave('profilePicture', e.target.files[0])}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            <p style={{...infoStyle, marginBottom: '2rem'}}><strong>{userData.firstName} {userData.lastName}</strong></p>
             
            <div style={{minHeight: '4.5rem'}}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {editStates.phone ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    style={{ ...infoStyle, flex: 1 }}
                  />  
                ) : (
                  <p style={{ ...infoStyle, flex: 1, margin: 0 }}><strong>{formatPhoneNumber(userData.phone || '')}</strong></p>
                )}
                <button
                  onClick={() => {
                    if (editStates.phone) {
                      handleSave('phone');
                    } else {
                      setEditStates(prev => ({ ...prev, phone: !prev.phone }));
                    }
                  }}
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  {editStates.phone ? '💾' : '✏️'}
                </button>
              </div>
              {messages.phone && (
                <p style={{ color: messages.phone.includes('Failed') || messages.phone.includes('valid') ? 'red' : 'green', marginTop: '0.25rem', fontSize: '14px' }}>
                  {messages.phone}
                </p>
              )}
            </div>
            <div style={{minHeight:'4.5rem'}}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                {editStates.email ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    style={{ ...infoStyle, flex: 1 }}
                  />
                ) : (
                  <p style={{ ...infoStyle, flex: 1, margin: 0 }}><strong>{userData.email}</strong></p>
                )}
                <button
                  onClick={() => {
                    if (editStates.email) {
                      handleSave('email');
                    } else {
                      setEditStates(prev => ({ ...prev, email: !prev.email }));
                    }
                  }}
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  {editStates.email ? '💾' : '✏️'}
                </button>
              </div>
              {messages.email && (
                <p style={{ color: messages.email.includes('Failed') || messages.email.includes('valid') ? 'red' : 'green', marginTop: '0.25rem', fontSize: '14px' }}>
                  {messages.email}
                </p>
              )}
            </div>



          </section>
          <section
            id="password"
            style={{padding: '0rem 0.5rem'}}
            >
            <span style={{fontWeight: '500', fontSize: '15px'}}>Password</span>
            <div style={{minHeight: '4.5rem', marginTop: '1rem'}}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {editStates.password ? (
                  <input
                    type="text" // always visible while editing
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    style={{ ...infoStyle, flex: 1 }}
                  />
                ) : (
                  <p style={{ ...infoStyle, flex: 1, margin: 0 }}>
                    <strong>{showPassword ? userData.password : '••••••••'}</strong>
                  </p>
                )}
                {/* Disabled toggle while editing */}
                {!editStates.password && (
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ padding: '4px 8px', fontSize: '12px' }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                )}
                <button
                  onClick={() => {
                    if (editStates.password) {
                      handleSave('password');
                    } else {
                      setEditStates(prev => ({ ...prev, password: !prev.password }));
                    }
                  }}
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  {editStates.password ? '💾' : '✏️'}
                </button>
              </div>
              {messages.password && (
                <p style={{ color: messages.password.includes('Failed') || messages.password.includes('valid') ? 'red' : 'green', marginTop: '0.25rem', fontSize: '14px' }}>
                  {messages.password}
                </p>
              )}
          </div>
          </section>
          <section
            id="accountControl"
            style={{padding: '1rem 0.5rem'}}
            >
              <span style={{fontWeight: '500', fontSize: '15px'}}>Account Control</span>
              <div style={{ display: 'flex', paddingTop: '1rem', gap: '33rem'}}>
                <span style={{fontWeight: '300', fontSize: '13px'}}>Delete Account</span>
                <button style={{ display: 'flex', border: 'none', background: 'none', color: 'darkred', fontWeight: '300', fontSize: '13px', padding: '0'}} onClick={()=> handleDelete(formData.id)}>Delete</button>
              </div>
          </section>
        </div>
    </div>
  );
}
