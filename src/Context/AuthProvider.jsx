import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { useCurrentUser } from '../Hooks/useCurrentUser';

const AuthProvider = ({ children }) => {
  const { data: initialUser, isLoading, refetch } = useCurrentUser();

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("userInfo");
    return saved ? JSON.parse(saved) : initialUser || null;
  });

  useEffect(() => {
    if (initialUser) setUser(initialUser);
  }, [initialUser]);

  const loginUser = (userData, token) => {
    setUser(userData);
    localStorage.setItem("userInfo", JSON.stringify(userData));
    localStorage.setItem("authToken", token);
    refetch?.();
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem("userInfo");
    localStorage.removeItem("authToken");
  };

  const authInfo = {
    user,
    loading: isLoading,
    refetchUser: refetch,
    loginUser,  
    logoutUser, 
  };

  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
