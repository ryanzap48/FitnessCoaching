import React, { createContext, useState, useContext, useCallback } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userAnswers, setUserAnswers] = useState({});

  const updateAnswer = useCallback((key, value) => {
    setUserAnswers(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetAnswers = useCallback(() => {
    setUserAnswers({});
  }, []);
  
  return (
    <UserContext.Provider value={{ userAnswers, updateAnswer, resetAnswers }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
