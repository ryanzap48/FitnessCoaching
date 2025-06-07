import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './css/App.css';

import { UserProvider } from './contexts/UserContext';
import { AuthProvider, useAuth } from './contexts/AuthContext'; 
import ProtectedRoute from './components/router/ProtectedRoute';  
import PublicOnlyRoute from './components/router/PublicOnlyRoute';
import { gsap } from 'gsap';

import Home from './components/new/Home.js';
import Question0 from './components/questions/Question0';
import Question1 from './components/questions/Question1';
import Question2 from './components/questions/Question2';
import Question3 from './components/questions/Question3';
import Question4 from './components/questions/Question4';
import Question5 from './components/questions/Question5';
import Question6 from './components/questions/Question6';
import Question7 from './components/questions/Question7';
import Question8 from './components/questions/Question8';
import Question9 from './components/questions/Question9';
import Question10 from './components/questions/Question10';
import Question11 from './components/questions/Question11';
import Finish from './components/questions/Finish'
import Login from './components/new/Login'
import MyWorkouts from './components/user/MyWorkouts'
import WorkoutDetail from './components/admin/WorkoutDetail';
import AdminWorkouts from './components/admin/AdminWorkouts.js';
import MyNutrition from './components/user/MyNutrition.js'
import SecretAdmin from './components/admin/SecretAdmin.js'

import CreateWorkout from './components/admin/create/CreateWorkout.js';
import CreateMealPlan from './components/admin/create/CreateMealPlan.js';

import ConsultationForm from './components/new/ConsultationForm.js';
import AdminConsultationList from './components/admin/AdminConsultationList.js';
import AdminUserList from './components/admin/AdminUserList.js';

import DashboardRouter from './components/router/DashboardRouter.js';
import AdminRecipes from './components/admin/AdminRecipeList.js';

import CreateRecipe from './components/admin/create/CreateRecipe.js';



function App() {
 const [menuOpen, setMenuOpen] = useState(false);
 
  return (
    <AuthProvider>
      <UserProvider>
        <Router>
            <Navigation menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
              <MainContent menuOpen={menuOpen} />
                <Routes>
                  

                  
                  <Route path="/" element={<PublicOnlyRoute> <Home /> </PublicOnlyRoute>} />
                  <Route path="/question0" element={<PublicOnlyRoute><Question0 /></PublicOnlyRoute>} />
                  <Route path="/question1" element={<PublicOnlyRoute><Question1 /></PublicOnlyRoute>} />
                  <Route path="/question2" element={<PublicOnlyRoute><Question2 /></PublicOnlyRoute>} />
                  <Route path="/question3" element={<PublicOnlyRoute><Question3 /></PublicOnlyRoute>} />
                  <Route path="/question4" element={<PublicOnlyRoute><Question4 /></PublicOnlyRoute>} />
                  <Route path="/question5" element={<PublicOnlyRoute><Question5 /></PublicOnlyRoute>} />
                  <Route path="/question6" element={<PublicOnlyRoute><Question6 /></PublicOnlyRoute>} />
                  <Route path="/question7" element={<PublicOnlyRoute><Question7 /></PublicOnlyRoute>} />
                  <Route path="/question8" element={<PublicOnlyRoute><Question8 /></PublicOnlyRoute>} />
                  <Route path="/question9" element={<PublicOnlyRoute><Question9 /></PublicOnlyRoute>} />
                  <Route path="/question10" element={<PublicOnlyRoute><Question10 /></PublicOnlyRoute>} />
                  <Route path="/question11" element={<PublicOnlyRoute><Question11 /></PublicOnlyRoute>} />
                  <Route path="/finish" element={<PublicOnlyRoute><Finish /></PublicOnlyRoute>} />
                  
                  <Route path="/consultationform" element={<PublicOnlyRoute> <ConsultationForm /> </PublicOnlyRoute>} />
                  <Route path="/login" element={<PublicOnlyRoute> <Login /> </PublicOnlyRoute>} />
  

                  
                  <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['user', 'admin']}> <DashboardRouter /> </ProtectedRoute>} />


                  <Route path="/myworkouts" element={<ProtectedRoute allowedRoles={['user']}> <MyWorkouts /> </ProtectedRoute>} />
                  <Route path="/workout/:id" element={<ProtectedRoute allowedRoles={['user', 'admin']}> <WorkoutDetail/> </ProtectedRoute>} />
                  <Route path="/mynutrition" element={<ProtectedRoute allowedRoles={['user']}> <MyNutrition /> </ProtectedRoute>} />

                  
                  <Route path="/secretadmin" element={<ProtectedRoute allowedRoles={['admin']}> <SecretAdmin /> </ProtectedRoute>} />
                  <Route path="/createworkout" element={<ProtectedRoute allowedRoles={['admin']}><CreateWorkout /></ProtectedRoute>} />
                  <Route path="/createrecipe" element={<ProtectedRoute allowedRoles={['admin']}><CreateRecipe /></ProtectedRoute>} />
                  <Route path="/createmealplan" element={<ProtectedRoute allowedRoles={['admin']}><CreateMealPlan /></ProtectedRoute>} />
                  <Route path="/adminworkouts" element={<ProtectedRoute allowedRoles={['admin']}> <AdminWorkouts /> </ProtectedRoute>} />
                  <Route path="/adminconsultationlist" element={<ProtectedRoute allowedRoles={['admin']}><AdminConsultationList /></ProtectedRoute>} />
                  <Route path="/adminuserlist" element={<ProtectedRoute allowedRoles={['admin']}><AdminUserList /></ProtectedRoute>} />
                  <Route path="/adminrecipes" element={<ProtectedRoute allowedRoles={['admin']}>  <AdminRecipes/> </ProtectedRoute> }/>
                  
                </Routes>
              
        </Router>
      </UserProvider>
    </AuthProvider>
  );
}

function MainContent({ menuOpen, children }) {
  return (
    <main
      style={{
        transition: 'margin-top 0.3s ease, filter 0.3s ease',
        filter: menuOpen ? 'blur(4px)' : 'none',
        padding: 20,
        
      }}
    >
      {children}
    </main>
  );
}


function Navigation({ menuOpen, setMenuOpen }) {
  const { isAuthenticated, logout, isAdmin } = useAuth();
  const menuRef = useRef(null);

  useEffect(() => {
    if (menuOpen) {
      menuRef.current.style.display = 'flex'; // show menu
      gsap.fromTo(
        menuRef.current,
        { height: 0, opacity: 0 },
        {
          height: 'auto',
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
        }
      );
    } else {
      gsap.to(menuRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          menuRef.current.style.display = 'none';
        },
      });
    }
  }, [menuOpen]);

  useEffect(() => {
    function handleScroll() {
      if (menuOpen) {
        setMenuOpen(false);
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [menuOpen, setMenuOpen]);

  // Handle responsive flex direction for menu links
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth <= 600) {
        // Mobile: vertical menu
        if (menuRef.current) {
          menuRef.current.style.flexDirection = 'column';
          menuRef.current.style.alignItems = 'flex-start';
          menuRef.current.style.padding = '10px 20px';
        }
      } else {
        // Desktop: horizontal menu
        if (menuRef.current) {
          menuRef.current.style.flexDirection = 'row';
          menuRef.current.style.alignItems = 'center';
          menuRef.current.style.padding = '0';
        }
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hamburger line styles (simple morph to X)
  const lineStyles = {
    base: {
      width: '25px',
      height: '3px',
      backgroundColor: '#fff',
      margin: '5px 0',
      transition: '0.3s',
    },
    line1Open: { transform: 'rotate(45deg) translate(5px, 5px)' },
    line2Open: { opacity: 0 },
    line3Open: { transform: 'rotate(-45deg) translate(5px, -5px)' },
  };

  return (
      <>
      <nav style={styles.nav}
        >
        <div
          style={styles.hamburger}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setMenuOpen((prev) => !prev);
          }}
        >
          <div
            style={{
              ...lineStyles.base,
              ...(menuOpen ? lineStyles.line1Open : {}),
            }}
          />
          <div
            style={{
              ...lineStyles.base,
              ...(menuOpen ? lineStyles.line2Open : {}),
            }}
          />
          <div
            style={{
              ...lineStyles.base,
              ...(menuOpen ? lineStyles.line3Open : {}),
            }}
          />
        </div>

        <h1 style={styles.logo}>Zappone Fit Coaching</h1>
      </nav>

      <div 
        ref={menuRef} 
        style={styles.menu}
        
        >
        
        
        {isAuthenticated && (
        <>
          <Link to="/dashboard" onClick={() => setMenuOpen(false)} style={styles.menuItem}>
                Dashboard
          </Link>
          
          {isAdmin ? (
            <>
              <Link to="/createworkout" onClick={() => setMenuOpen(false)} style={styles.menuItem}>
                Create Workout
              </Link>
              <Link to="/adminworkouts" onClick={() => setMenuOpen(false)} style={styles.menuItem}>
                Workouts
              </Link>
              <Link to="/createrecipe" onClick={() => setMenuOpen(false)} style={styles.menuItem}>
                Create Recipe
              </Link>
              <Link to="/adminrecipes" onClick={() => setMenuOpen(false)} style={styles.menuItem}>
                AdminRecipes
              </Link>
              <Link to="/adminconsultationlist" onClick={() => setMenuOpen(false)} style={styles.menuItem}>
                Consultation
              </Link>
              <Link to="/adminuserlist" onClick={() => setMenuOpen(false)} style={styles.menuItem}>
                Users
              </Link>
              

              
            </>
          ) : (
            <>
              <Link to="/myworkouts" onClick={() => setMenuOpen(false)} style={styles.menuItem}>
                MyWorkouts
              </Link>
              <Link to="/mynutrition" onClick={() => setMenuOpen(false)} style={styles.menuItem}>
                MyNutrition
              </Link>

            </>
          )}

          <Link onClick={() => {
              logout();
              setMenuOpen(false);
            }}
            style={styles.menuItem}
          >
            Logout
          </Link>

        </>
      )}
        {!isAuthenticated && (
          <>
            <Link onClick={() => setMenuOpen(false)} to="/" style={styles.menuItem}>
            Home
          </Link>
          <Link to="/#about" onClick={() => setMenuOpen(false)} style={styles.menuItem} >
            About
          </Link>
            
          <Link to="/#offer" onClick={() => setMenuOpen(false)} style={styles.menuItem}>
              Our Offer
            </Link>
            <Link to="/#pricing" onClick={() => setMenuOpen(false)} style={styles.menuItem} >
              Pricing
            </Link>
          
          <Link
            onClick={() => setMenuOpen(false)}
            to="/login"
            style={styles.menuItem}
          >
            Login
          </Link>
          </>
        )}
      </div>
  </>
  );
}

const styles = {
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '60px',
    backgroundColor: '#111',
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    zIndex: 9999,
    justifyContent: 'space-between',
  },
  hamburger: {
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  logo: {
    color: '#fff',
    fontSize: '1.5rem',
    userSelect: 'none',
  },
  menu: {
    position: 'fixed',
    top: '60px',
    left: 0,
    right: 0,
    overflow: 'hidden',
    height: 0,
    backgroundColor: '#222',
    display: 'none',
    flexDirection: 'row', // row for desktop
    justifyContent: 'center', // center children horizontally
    alignItems: 'center',
    gap: '20px',
    
    opacity: 0,
    zIndex: 9999,
    textAlign: 'center', // helpful for button/text alignment
  },
  menuItem: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '1.1rem',
    padding: '5px 10px', // reduced padding for tighter spacing
    cursor: 'pointer',
    boxSizing: 'border-box',
    width: 'auto', // override mobile full-width for desktop
    textAlign: 'center',
  },

};

export default App;