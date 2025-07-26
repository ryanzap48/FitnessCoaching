import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';

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

import UserDashboard from './components/user/UserDashboard.js';
import AdminRecipes from './components/admin/AdminRecipeList.js';
import AdminMealPlans from './components/admin/AdminMealPlanList.js';

import CreateRecipe from './components/admin/create/CreateRecipe.js';

import MealPlanDetail from './components/admin/MealPlanDetail.js';

import CreateExercise from './components/admin/create/CreateExercise.js';
import AdminExercises from './components/admin/AdminExerciseList.js'

// Import your logo
import logo2 from './assets/logo2.png';


function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <AuthProvider>
      <UserProvider>
        <Router>
          <AppContent menuOpen={menuOpen} setMenuOpen={setMenuOpen} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </Router>
      </UserProvider>
    </AuthProvider>
  );
}


function AppContent({ menuOpen, setMenuOpen, sidebarOpen, setSidebarOpen }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState('');
  const [activeSecondaryPath, setActiveSecondaryPath] = useState(''); // Add this
  
  const location = useLocation(); // Add this import: import { useLocation } from 'react-router-dom';

  // Auto-select clients section and client list for admin users
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      setCurrentPage('clients');
      setActiveSecondaryPath('/adminuserlist');
    }
  }, [isAuthenticated, isAdmin]);

  function RouteWithHeader({ element, title }) {
    return (
      <>
        <PageHeader title={title} />
        {element}
      </>
    );
  }


  return (
    <>
      {/* Show top navigation for public users */}
      {!isAuthenticated && (
        <Navigation menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      )}
      
      {/* Show left sidebar for authenticated users */}
      {isAuthenticated && (
        <>
          <LeftSidebar 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen} 
            setCurrentPage={setCurrentPage}
            setActiveSecondaryPath={setActiveSecondaryPath} // Add this
            currentPath={location.pathname} // Add this
            currentPage={currentPage}
          />
          <SecondarySidebar 
            sidebarOpen={sidebarOpen} 
            currentPage={currentPage}
            activeSecondaryPath={activeSecondaryPath} // Add this
            setActiveSecondaryPath={setActiveSecondaryPath} // Add this
            currentPath={location.pathname} // Add this
            setCurrentPage={setCurrentPage} // Add this line
          />
        </>
      )}
      
      <MainContent 
        menuOpen={menuOpen} 
        sidebarOpen={sidebarOpen} 
        isAuthenticated={isAuthenticated}
        hasSecondarySidebar={currentPage !== ''}
      >
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

          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['user']}> <UserDashboard /> </ProtectedRoute>} />

          <Route path="/myworkouts" element={<ProtectedRoute allowedRoles={['user']}> <MyWorkouts /> </ProtectedRoute>} />
          <Route path="/workout/:id" element={<ProtectedRoute allowedRoles={['user', 'admin']}> <WorkoutDetail/> </ProtectedRoute>} />
          <Route path="/mynutrition" element={<ProtectedRoute allowedRoles={['user']}> <MyNutrition /> </ProtectedRoute>} />

          <Route path="/secretadmin" element={<ProtectedRoute allowedRoles={['admin']}> <SecretAdmin /> </ProtectedRoute>} />
          <Route path="/createworkout" element={<ProtectedRoute allowedRoles={['admin']}><RouteWithHeader title="Create Workout" element={<CreateWorkout />} /></ProtectedRoute>} />
          <Route path="/createrecipe" element={<ProtectedRoute allowedRoles={['admin']}><RouteWithHeader title="Create Recipe" element={<CreateRecipe />} /></ProtectedRoute>} />
          <Route path="/createmealplan" element={<ProtectedRoute allowedRoles={['admin']}><RouteWithHeader title="Create Meal Plan" element={<CreateMealPlan />} /></ProtectedRoute>} />
          <Route path="/createexercise" element={<ProtectedRoute allowedRoles={['admin']}><RouteWithHeader title="Create Exercise" element={<CreateExercise />} /></ProtectedRoute>} />
          <Route path="/adminworkouts" element={<ProtectedRoute allowedRoles={['admin']}> <RouteWithHeader title="Workout Library" element={<AdminWorkouts />} /> </ProtectedRoute>} />
          <Route path="/adminconsultationlist" element={<ProtectedRoute allowedRoles={['admin']}><RouteWithHeader title="Consultation Requests" element={<AdminConsultationList />} /></ProtectedRoute>} />
          <Route path="/adminuserlist" element={<ProtectedRoute allowedRoles={['admin']}><RouteWithHeader title="Client List" element={<AdminUserList />} /></ProtectedRoute>} />
          <Route path="/adminrecipes" element={<ProtectedRoute allowedRoles={['admin']}>  <RouteWithHeader title="Recipe Library" element={<AdminRecipes/>} /> </ProtectedRoute> }/>
          <Route path="/adminmealplans" element={<ProtectedRoute allowedRoles={['admin']}>  <RouteWithHeader title="Meal Plan Library" element={<AdminMealPlans/>} /> </ProtectedRoute> }/>
          <Route path="/adminexercises" element={<ProtectedRoute allowedRoles={['admin']}> <RouteWithHeader title="Exercise Library" element={<AdminExercises/>} />  </ProtectedRoute> }/>

          <Route path="/mealplans/:slug" element={<ProtectedRoute allowedRoles={['admin', 'user']}> <MealPlanDetail /> </ProtectedRoute>} />
        </Routes>
      </MainContent>
    </>
  );
}

function MainContent({ menuOpen, sidebarOpen, isAuthenticated, hasSecondarySidebar, children }) {
  const getMarginLeft = () => {
    if (!isAuthenticated) return '0';
    const primaryWidth = sidebarOpen ? 160 : 70;
    const secondaryWidth = hasSecondarySidebar ? 190 : 0;
    return `${primaryWidth + secondaryWidth}px`;
  };
  
  return (
    <main
      style={{
        transition: 'margin-left 0.3s ease, margin-top 0.3s ease, filter 0.3s ease',
        filter: menuOpen ? 'blur(4px)' : 'none',
        marginLeft: getMarginLeft(),
        marginTop: isAuthenticated ? '0' : '60px',
        padding: isAuthenticated ? '20px' : '0px',
        minHeight: '100vh',
      }}
    >
      {children}
    </main>
  );
}


function LeftSidebar({ sidebarOpen, setSidebarOpen, setCurrentPage, setActiveSecondaryPath, currentPath, currentPage }) {
  const { logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  const navigationConfig = {
    clients: {
      icon: '👥',
      label: 'Clients',
      adminPath: '/adminuserlist',
      relatedPaths: ['/adminuserlist', '/adminconsultationlist'],
      roles: ['admin']
    },
    profile: {
      icon: '👥',
      label: 'Profile',
      userPath: '/dashboard',
      relatedPaths: [],
      roles: ['user']
    },
    library: {
      icon: '📚',
      label: 'Library',
      adminPath: '/adminexercises',
      relatedPaths: ['/adminexercises', '/adminworkouts', '/adminrecipes', '/adminmealplans'],
      roles: ['admin']
    },
    workouts: {
      icon: '💪',
      label: 'Workouts',
      userPath: '/myworkouts',
      relatedPaths: [],
      roles: ['user']
    },
    nutrition: {
      icon: '💪',
      label: 'Nutrition',
      userPath: '/mynutrition',
      relatedPaths: [],
      roles: ['user']
    },
    create: {
      icon: '➕',
      label: 'Create',
      adminPath: '/createexercise',
      userPath: '/dashboard',
      relatedPaths: ['/createexercise', '/createworkout', '/createrecipe', '/createmealplan'],
      roles: ['admin']
    },
    settings: {
      icon: '⚙️',
      label: 'Settings',
      adminPath: '/adminsettings',
      userPath: '/usersettings',
      relatedPaths: [],
      roles: ['admin', 'user']
    }
  };

  const styles = {
    sidebar: {
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      width: sidebarOpen ? '160px' : '70px',
      backgroundColor: '#111',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px 0',
      zIndex: 9999,
      overflow: 'hidden',
      transition: 'width 0.3s ease',
      transform: 'translateZ(0)',
    },
    navItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 20px',
      color: '#fff',
      textDecoration: 'none',
      fontSize: '1.2rem',
      transition: 'background-color 0.3s ease',
      whiteSpace: 'nowrap',
    },
    navItemIcon: {
      minWidth: '20px',
      textAlign: 'center'
    },
    navItemText: {
      marginLeft: '25px',
      opacity: sidebarOpen ? 1 : 0,
      transition: 'opacity 0.3s ease',
    },
    logoutButton: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '2rem',
      padding: '12px 20px',
      color: '#fff',
      background: 'none',
      border: 'none',
      fontSize: '1.2rem',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      whiteSpace: 'nowrap',
      width: '100%',
    }
  };

  // Helper functions using the config
  const getPath = (config) => isAdmin ? config.adminPath : config.userPath;
  
  const isActiveMainSection = (config) => {
    return config.relatedPaths.some(path => currentPath.includes(path));
  };

  const shouldShowItem = (config) => {
    const userRole = isAdmin ? 'admin' : 'user';
    return config.roles.includes(userRole);
  };

  const handleHover = (e, isEntering, isActive) => {
    if (!isActive) {
      e.target.style.backgroundColor = isEntering ? '#333' : 'transparent';
    }
  };

 const handleNavClick = (key, config, event) => {
    console.log({key});
    console.log({currentPage});
    
    // Check if clicking on the currently active section
    if (currentPage === key) {
      event.preventDefault(); // Prevent navigation
      setCurrentPage(''); // Retract the secondary sidebar
      setActiveSecondaryPath('');
      return;
    }

    // For items that don't have secondary sidebars, navigate directly
    if (['nutrition', 'workouts', 'profile', 'settings'].some(k => key.includes(k))) {
      const path = getPath(config);
      navigate(path);
      setCurrentPage(''); // Clear current page to hide secondary sidebar
      setActiveSecondaryPath('');
      return;
    }
    
    setCurrentPage(key);
    
    const defaultPath = getPath(config);
    if (defaultPath) {
      setActiveSecondaryPath(defaultPath);
      navigate(defaultPath);
    }
};

  return (
    <>
      <div ref={sidebarRef} style={styles.sidebar}>
        {/* Logo */}
        <div
          style={{
            width: '70%',
            cursor: 'pointer'
          }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <img
            src={logo2}
            alt="Zappone Fit Coaching"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>

        {/* Navigation Items */}
       {/* Navigation Items */}
<div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
  {Object.entries(navigationConfig).map(([key, config]) => {
    if (!shouldShowItem(config)) {
      return null;
    }
    
    // Skip settings here - we'll render it separately
    if (key === 'settings') {
      return null;
    }
    
    const isActive = isActiveMainSection(config);
    const path = getPath(config);
    
    return (
      <Link
        key={key}
        to={path}
        onClick={(event) => handleNavClick(key, config, event)}
        style={{
          ...styles.navItem,
          backgroundColor: isActive ? '#444' : 'transparent',
        }}
        onMouseEnter={(e) => handleHover(e, true, isActive)}
        onMouseLeave={(e) => handleHover(e, false, isActive)}
      >
        <span style={styles.navItemIcon}>{config.icon}</span>
        <span style={styles.navItemText}>
          {config.label}
        </span>
      </Link>
    );
  })}
</div>

      {/* Settings Button (directly above logout) */}
      <div style={{ marginTop: 'auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {navigationConfig.settings && shouldShowItem(navigationConfig.settings) && (
          <Link
            to={getPath(navigationConfig.settings)}
            onClick={(event) => handleNavClick('settings', navigationConfig.settings, event)}
            style={{
              ...styles.navItem,
              backgroundColor: isActiveMainSection(navigationConfig.settings) ? '#444' : 'transparent',
            }}
            onMouseEnter={(e) => handleHover(e, true, isActiveMainSection(navigationConfig.settings))}
            onMouseLeave={(e) => handleHover(e, false, isActiveMainSection(navigationConfig.settings))}
          >
            <span style={styles.navItemIcon}>{navigationConfig.settings.icon}</span>
            <span style={styles.navItemText}>
              {navigationConfig.settings.label}
            </span>
          </Link>
        )}
        
        {/* Logout Button */}
        <button
          onClick={logout}
          style={styles.logoutButton}
          onMouseEnter={(e) => handleHover(e, true, false)}
          onMouseLeave={(e) => handleHover(e, false, false)}
        >
          <span style={styles.navItemIcon}>🚪</span>
          <span
            style={{
              marginLeft: '15px',
              opacity: sidebarOpen ? 1 : 0,
              transition: 'opacity 0.2s ease',
            }}
          >
            Logout
          </span>
        </button>
      </div>
      </div>
    </>
  );
}

function SecondarySidebar({ sidebarOpen, currentPage, activeSecondaryPath, setActiveSecondaryPath, currentPath, setCurrentPage }) {
  const { isAdmin } = useAuth();
  const secondaryRef = useRef(null);

  // Single configuration object for all secondary navigation items
  const secondaryNavigationConfig = {
    library: [
      { label: 'Exercises', adminPath: '/adminexercises', userPath: '/exercises', roles: ['admin'] },
      { adminPath: '/adminworkouts', userPath: '/myworkouts', adminLabel: 'Workouts', userLabel: 'My Workouts' },
      { label: 'Recipes', adminPath: '/adminrecipes', userPath: '/recipes', roles: ['admin'] },
      { adminPath: '/adminmealplans', userPath: '/mealplans', adminLabel: 'Meal Plans', userLabel: 'My Meal Plans' },
    ],
    clients: [
      { label: 'All Clients', path: '/adminuserlist' },
      { label: 'Consultations', path: '/adminconsultationlist' },
    ],
    create: [
      { label: 'Create Exercise', path: '/createexercise' },
      { label: 'Create Workout', path: '/createworkout' },
      { label: 'Create Recipe', path: '/createrecipe' },
      { label: 'Create Meal Plan', path: '/createmealplan' },
    ]
  };

  // Common styles to avoid repetition
  const styles = {
    sidebar: {
      position: 'fixed',
      top: 0,
      left: sidebarOpen ? '160px' : '70px',
      height: '100vh',
      width: '190px',
      backgroundColor: '#1a1a1a',
      borderRight: '1px solid #333',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 0',
      zIndex: 9998,
      overflow: 'hidden',
      transition: 'left .3s ease',
      transform: 'translateZ(0)',
    },
    header: {
      padding: '20px 15px',
      borderBottom: '1px solid #333',
      marginBottom: '20px'
    },
    headerTitle: {
      color: '#fff',
      margin: 0,
      fontSize: '1.1rem',
      textTransform: 'capitalize'
    },
    itemsContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
      paddingRight: '10px'
    },
    navItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '10px 15px',
      textDecoration: 'none',
      fontSize: '0.9rem',
      transition: 'background-color 0.2s ease, color 0.2s ease',
      borderRadius: '4px',
      margin: '0 5px',
    },
    navItemIcon: {
      minWidth: '20px',
      textAlign: 'center',
      marginRight: '10px'
    }
  };

  // Helper functions
  const getItemPath = (item) => {
    if (item.adminPath && item.userPath) {
      return isAdmin ? item.adminPath : item.userPath;
    }
    return item.path;
  };

  const getSecondaryItems = () => {
    const items = secondaryNavigationConfig[currentPage] || [];
    return items
    .filter(item => !item.roles || item.roles.includes(isAdmin ? 'admin' : 'user'))
    .map(item => ({
      ...item,
      path: getItemPath(item),
      label: item.adminLabel && item.userLabel 
        ? (isAdmin ? item.adminLabel : item.userLabel)
        : item.label
    }));
  };

  const isActiveItem = (itemPath) => {
    return currentPath === itemPath || activeSecondaryPath === itemPath;
  };

  const getItemStyle = (isActive) => ({
    ...styles.navItem,
    color: isActive ? '#007bff' : '#ccc',
    backgroundColor: isActive ? '#333' : 'transparent',
    fontWeight: isActive ? '600' : 'normal',
  });

  const handleHover = (e, isEntering, isActive) => {
    if (!isActive) {
      e.target.style.backgroundColor = isEntering ? '#333' : 'transparent';
      e.target.style.color = isEntering ? '#fff' : '#ccc';
    }
  };

  const handleItemClick = (itemPath) => {
    setActiveSecondaryPath(itemPath);
  };

  // Get secondary items for current page
  const secondaryItems = getSecondaryItems();

  // Set default active path if none exists
  useEffect(() => {
    if (secondaryItems.length > 0 && !activeSecondaryPath) {
      setActiveSecondaryPath(secondaryItems[0].path);
    }
  }, [currentPage, activeSecondaryPath, setActiveSecondaryPath, secondaryItems]);

  // Don't render if no items
  if (secondaryItems.length === 0) return null;

  return (
    <div ref={secondaryRef} style={styles.sidebar}>
      
      <div style={styles.header}>
        <h3 style={styles.headerTitle}>
          {currentPage}
        </h3>
      </div>

      <div style={styles.itemsContainer}>
        {secondaryItems.map((item, index) => {
          const isActive = isActiveItem(item.path);

          return (
            <Link
              key={index}
              to={item.path}
              onClick={() => handleItemClick(item.path)}
              style={getItemStyle(isActive)}
              onMouseEnter={(e) => handleHover(e, true, isActive)}
              onMouseLeave={(e) => handleHover(e, false, isActive)}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function PageHeader( {title}) {
  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      borderBottom: '1px solid #ccc',
      paddingBottom: '10px',
      marginBottom: '20px',
      marginTop: '10px',
    },

    title: {
      fontSize: '1.5rem',
      margin: 0,
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{title}</h2>
    </div>
  );
}



function Navigation({ menuOpen, setMenuOpen }) {

  const menuRef = useRef(null);

  useEffect(() => {
    if (menuOpen) {
      menuRef.current.style.display = 'flex';
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

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth <= 600) {
        if (menuRef.current) {
          menuRef.current.style.flexDirection = 'column';
          menuRef.current.style.alignItems = 'flex-start';
          menuRef.current.style.padding = '10px 20px';
        }
      } else {
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
      <nav style={styles.nav}>
        <div
          style={styles.hamburger}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
          id="toggle-menu"
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

      <div ref={menuRef} style={styles.menu}>
        <Link onClick={() => setMenuOpen(false)} to="/" style={styles.menuItem}>
          Home
        </Link>
        <Link to="/#about" onClick={() => setMenuOpen(false)} style={styles.menuItem}>
          About
        </Link>
        <Link to="/#offer" onClick={() => setMenuOpen(false)} style={styles.menuItem}>
          Our Offer
        </Link>
        <Link to="/#pricing" onClick={() => setMenuOpen(false)} style={styles.menuItem}>
          Pricing
        </Link>
        <Link onClick={() => setMenuOpen(false)} to="/login" style={styles.menuItem}>
          Login
        </Link>
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    opacity: 0,
    zIndex: 9999,
    textAlign: 'center',
  },
  menuItem: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '1.1rem',
    padding: '5px 10px',
    cursor: 'pointer',
    boxSizing: 'border-box',
    width: 'auto',
    textAlign: 'center',
  },
};

export default App;