// auth-context.js
import React, { useState, useEffect, createContext } from 'react';

export const AuthContext = createContext({
  isLoggedIn: false,
  userId: null,
  token: null,
  login: () => {},
  logout: () => {}
});

export const AuthProvider = (props) => {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [name, setname] = useState(null);

  useEffect(() => {
    const storedData = JSON.parse(sessionStorage.getItem('userData'));
    if (storedData && storedData.token && storedData.name) {
      setToken(storedData.token);
      setUserId(storedData.userId);
    }
  }, []);

  const login = (uid, token, name) => {
    setToken(token);
    setUserId(uid);
    setname(name);
    sessionStorage.setItem(
      'userData',
      JSON.stringify({
        userId: uid,
        token: token,
        name: name
      })
    );
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    setname(null);
    sessionStorage.removeItem('userData');
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token: token,
        userId: userId,
        name: name,
        login: login,
        logout: logout
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};
