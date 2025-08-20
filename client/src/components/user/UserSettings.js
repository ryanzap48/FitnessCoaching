import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function UserSettings() {
  const { token } = useAuth();
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const [profilePic, setProfilePic] = useState(null); // image file or URL

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
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        phone: currentUser.phone,
        profileColor: currentUser.profileColor,
      });
      setLoading(false);
    };
    fetchData();
  }, [token]);
  

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async () => {
      const res = await fetch(`http://localhost:9000/users/${userData._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Update failed');
      const updated = await res.json();
      setUserData(updated);
      setEditMode(false);
      setMessage('Profile updated successfully!');
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imgURL = URL.createObjectURL(file);
      setProfilePic(imgURL);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{
      padding: '1.5rem',
      margin: 'auto',
      borderRadius: '10px',
      background: 'linear-gradient(145deg, #f0f0f0, #dcdcdc)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      textAlign: 'center'
    }}>
      {/* Profile Picture / Initials */}
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          backgroundColor: profilePic ? 'transparent' : formData.profileColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          fontSize: '2.5rem',
          color: '#fff',
          
          boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
        }}>
          {profilePic ? (
            <img
              src={profilePic}
              alt="Profile"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            formData.firstName.trim()[0].toUpperCase() + formData.lastName.trim()[0].toUpperCase()
          )}
          
        </div>
        <div style={{marginLeft: '1.5rem'}}>
          <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
            
            {editMode ? (
              <>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px' }}
                />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px' }}
                />
              </>
            ) : (
              <p><strong>{userData.firstName} {userData.lastName}</strong></p>
            )}
          </div>

          <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
            {editMode ? (
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px' }}
              />
            ) : (
              <p><strong>{userData.phone}</strong></p>
            )}
          </div>
          <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
            {editMode ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px' }}
              />
            ) : (
              <p><strong>{userData.email}</strong></p>
            )}
          </div>

        </div>
      </div>

      {/* Upload button */}
      <label style={{
        display: 'inline-block',
        marginBottom: '1rem',
        cursor: 'pointer',
        color: '#007BFF',
        textDecoration: 'underline'
      }}>
        Change Picture
        <input
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleProfilePicChange}
          style={{ display: 'none' }}
        />
      </label>

      <h2>User Settings</h2>
      {message && <p>{message}</p>}

      

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        {editMode ? (
          <>
            <button onClick={handleSave}>Save</button>
            <button onClick={() => {
              setEditMode(false);
              setFormData({
                firstName: userData.firstName,
                email: userData.email
              });
            }}>Cancel</button>
          </>
        ) : (
          <button onClick={() => setEditMode(true)}>Edit Info</button>
        )}
      </div>
    </div>
  );
}
