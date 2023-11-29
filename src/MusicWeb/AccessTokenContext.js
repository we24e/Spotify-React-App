import React, { createContext, useState, useContext } from 'react';

const AccessTokenContext = createContext();

export const useAccessToken = () => useContext(AccessTokenContext);

export const AccessTokenProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState('');

    return (
        <AccessTokenContext.Provider value={{ accessToken, setAccessToken }}>
            {children}
        </AccessTokenContext.Provider>
    );
};
