import { createContext, useContext, useState, useEffect } from 'react';
import { users } from '../data/mockData';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    const sessionExpiry = localStorage.getItem('sessionExpiry');
    
    if (storedUser && sessionExpiry) {
      const now = new Date().getTime();
      if (now < parseInt(sessionExpiry)) {
        setCurrentUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
        startSessionTimeout();
      } else {
        // Session expired
        logout();
      }
    }
  }, []);

  // Start 30-minute session timeout
  const startSessionTimeout = () => {
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }

    const timeout = setTimeout(() => {
      alert('Your session has expired due to inactivity. Please log in again.');
      logout();
    }, 30 * 60 * 1000); // 30 minutes

    setSessionTimeout(timeout);
    
    // Store expiry time
    const expiryTime = new Date().getTime() + (30 * 60 * 1000);
    localStorage.setItem('sessionExpiry', expiryTime.toString());
  };

  // Reset session timeout on activity
  const resetSessionTimeout = () => {
    if (isAuthenticated) {
      startSessionTimeout();
    }
  };

  // Login function
  const login = (email, password) => {
    const user = users.find(
      (u) => u.email === email && u.password === password && u.isActive
    );

    if (user) {
      // Don't store password in session
      const { password: _, ...userWithoutPassword } = user;
      setCurrentUser(userWithoutPassword);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      startSessionTimeout();
      return { success: true, user: userWithoutPassword };
    }

    return { success: false, message: 'Invalid email or password' };
  };

  // Register function
  const register = (userData, autoLogin = false) => {
    // Check if email already exists
    const existingUser = users.find((u) => u.email === userData.email);
    if (existingUser) {
      return { success: false, message: 'Email already registered' };
    }

    // Validate password
    if (userData.password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }

    // Create new user
    const newUser = {
      id: userData.role === 'donor' ? `D${(users.filter(u => u.role === 'donor').length + 1).toString().padStart(3, '0')}` : `S${(users.filter(u => u.role === 'staff').length + 1).toString().padStart(3, '0')}`,
      role: userData.role,
      email: userData.email,
      password: userData.password,
      name: userData.name,
      phone: userData.phone,
      registrationDate: new Date().toISOString().split('T')[0],
      isActive: true,
      ...(userData.role === 'donor' && {
        bloodType: null,
        lastDonationDate: null,
        donationCount: 0
      }),
      ...(userData.role === 'staff' && {
        position: userData.position || 'Staff Member'
      })
    };

    // Add to users array (in real app, this would be a database call)
    users.push(newUser);

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    
    // Auto-login for donors who need to book first appointment
    if (autoLogin && userData.role === 'donor') {
      setCurrentUser(userWithoutPassword);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      startSessionTimeout();
    }
    
    return { success: true, message: 'Registration successful! Please log in.', user: userWithoutPassword };
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('sessionExpiry');
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }
  };

  // Update user profile
  const updateProfile = (updates) => {
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // Update in users array
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
    }
    
    return { success: true };
  };

  // Update blood type for a specific user (used by staff)
  const updateUserBloodType = (userId, bloodType) => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].bloodType = bloodType;
      
      // If it's the current user, update their session too
      if (currentUser && currentUser.id === userId) {
        const updatedUser = { ...currentUser, bloodType };
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
      
      return { success: true };
    }
    return { success: false, message: 'User not found' };
  };

  const value = {
    currentUser,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    updateUserBloodType,
    resetSessionTimeout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
