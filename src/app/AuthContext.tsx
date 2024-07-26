'use client'
import React, { createContext, useState, useContext, ReactNode, FunctionComponent, useEffect } from 'react';

interface AuthContextType {
    tokenExists: boolean;
    email: string;
    role: string;
    setokenExists: (tokenExists: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Function to parse cookies
const getCookies = (): { [key: string]: string } => {
    return document.cookie.split('; ').reduce((acc, current) => {
        const [name, value] = current.split('=');
        acc[name] = value;
        return acc;
    }, {} as { [key: string]: string });
};

const verifyToken = async (token: string) => {
    try {
        const response = await fetch("http://127.0.0.1:3001/verifyauth", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        });
        if (response.ok) {
            return true;
        }
    } catch (error) {
        console.log(error);
    }
}

const getUserData = async (token: string) => {
    const response = await fetch("http://127.0.0.1:3001/user", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    });
    if (response.ok) {
        const data = await response.json();
        return data;
    }
}


export const AuthProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
    const [tokenExists, setokenExists] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('');
    const [role, setRole] = useState<string>('');

    useEffect(() => {
        const cookies = getCookies();
        verifyToken(cookies.token).then((res) => {
            if (res) {
                setokenExists(true);
                getUserData(cookies.token).then((user) => {
                    setEmail(user.email);
                    setRole(user.role);
                });
            }
        });
    }, []);

    return (
        <AuthContext.Provider value={{ tokenExists, setokenExists, email, role }}>
            {children}
        </AuthContext.Provider>
    );
};