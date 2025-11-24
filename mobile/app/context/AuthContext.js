// src/context/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ⬅️ Import AsyncStorage

// Initialize the Context
const AuthContext = createContext({
    userId: null,
    isLoggedIn: false,
    login: () => {},
    logout: () => {},
});

// The key used in your Login.js to save the student ID
const USER_ID_STORAGE_KEY = "student_number"; 

export const AuthProvider = ({ children }) => {
    const [userId, setUserId] = useState(null); 
    const [isLoading, setIsLoading] = useState(true); // ⬅️ NEW: Tracks if we're done checking storage
    const isLoggedIn = !!userId;

    // 1. Function to check AsyncStorage on app startup
    const loadUserFromStorage = async () => {
        try {
            const storedId = await AsyncStorage.getItem(USER_ID_STORAGE_KEY); 
            if (storedId) {
                setUserId(storedId); // Set the state if the ID is found
            }
        } catch (error) {
            console.error("Failed to load user from storage:", error);
        } finally {
            setIsLoading(false); // Stop loading regardless of outcome
        }
    };

    // 2. This runs once when AuthProvider mounts
    useEffect(() => {
        loadUserFromStorage();
    }, []); 

    // 3. Update userId state and save to storage on successful login
    const login = async (id) => {
        setUserId(id);
        // Save the ID to storage when the login function is called
        await AsyncStorage.setItem(USER_ID_STORAGE_KEY, id); 
    };
    
    // 4. Clear userId state and remove from storage on logout
    const logout = async () => {
        setUserId(id);
        await AsyncStorage.removeItem(USER_ID_STORAGE_KEY);
    };

    // 5. If loading, render nothing (or a splash screen)
    if (isLoading) {
      return null; 
      // Replace with a full-screen loading component for a better user experience
    }

    const contextValue = {
        userId,
        isLoggedIn,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);