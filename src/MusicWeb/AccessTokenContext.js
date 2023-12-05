// AccessTokenContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AccessTokenContext = createContext();

export const AccessTokenProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(null);

    useEffect(() => {
        const getAccessToken = async () => {
            try {
                const response = await axios.post('http://localhost:4000/getAccessToken');
                setAccessToken(response.data.access_token);
            } catch (error) {
                console.error('Error fetching access token:', error);
            }
        };

        getAccessToken();
    }, []);

    return (
        <AccessTokenContext.Provider value={{ accessToken, setAccessToken }}>
            {children}
        </AccessTokenContext.Provider>
    );
};
