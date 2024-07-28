'use client'
import { jwtDecode } from 'jwt-decode';
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
    let decodedToken: { userId: string; } | undefined;
    try {
        decodedToken = jwtDecode(token as string);
    } catch (error) {
        console.log('Not token found!');
    }

    let graphql = JSON.stringify({
        query: "query GetUserById($getUserByIdId: ID!) {\r\n  getUserById(id: $getUserByIdId) {\r\n    email\r\n    isDriver\r\n  }\r\n}",
        variables: { "getUserByIdId": decodedToken?.userId }
    })
    const response = await fetch("http://127.0.0.1:4000/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
        },
        body: graphql
    });
    if (response.ok) {
        const data = await response.json();
        let User = data.data.getUserById;
        return User;
    }
}

export const AuthProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
    const [mounted, setMounted] = useState(false);
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
                    setRole(user.isDriver ? 'Driver' : 'Rider');
                });
            }
        });
    }, []);
    useEffect(() => {
        setMounted(true)
    }, [])
    if (!mounted) return null
    return (
        <AuthContext.Provider value={{ tokenExists, setokenExists, email, role }}>
            {children}
        </AuthContext.Provider>
    );
};