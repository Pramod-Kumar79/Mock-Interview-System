import React, { createContext, useEffect, useState } from 'react';

export const GlobalContext = createContext();

const USER_STORAGE_KEY = 'mis_user';
const TOKEN_STORAGE_KEY = 'mis_token';

export const GlobalProvider = ({ children }) => {
  const [gJobRole, setGJobRole] = useState('');
  const [gJobExp, setGJobExp] = useState('');
  const [gQtns, setGQtns] = useState([]);
  const [gAns, setGAns] = useState([]);
  const [gValidInterview, setGValidInterview] = useState(null); // should be null
  const [gValidReview, setGValidReview] = useState(false);
  const [gSuspiciousCount, setGSuspiciousCount] = useState(0);
  const [gEmotionData, setGEmotionData] = useState("User did not turn on camera, hence no emotion analysis data is available");

  // ---- Auth state ----------------------------------------------------
  const [gUser, setGUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [gToken, setGToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) || null);

  useEffect(() => {
    if (gUser && gToken) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(gUser));
      localStorage.setItem(TOKEN_STORAGE_KEY, gToken);
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, [gUser, gToken]);

  const loginUser = (user, token) => {
    setGUser(user);
    setGToken(token);
  };

  const logoutUser = () => {
    setGUser(null);
    setGToken(null);
  };

  const updateGQtnGenerationData = (jobRole, jobExp, questions) => {
    setGJobRole(jobRole);
    setGJobExp(jobExp);
    setGQtns(questions);
  };

  return (
    <GlobalContext.Provider value={{ gJobRole, gJobExp, gQtns, gValidInterview,
     updateGQtnGenerationData, setGValidInterview,
     gSuspiciousCount, setGSuspiciousCount,
     gAns, setGAns,
     gEmotionData, setGEmotionData,
     gValidReview, setGValidReview,
     gUser, gToken, loginUser, logoutUser }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
