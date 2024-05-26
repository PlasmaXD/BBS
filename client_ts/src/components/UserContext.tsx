import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface UserContextType {
    user: { userId: string; username: string } | null;
    setUser: (user: { userId: string; username: string } | null) => void;
    logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<{ userId: string; username: string } | null>(null);

    useEffect(() => {
        const storedUserId = localStorage.getItem('user_id');
        const storedUsername = localStorage.getItem('username');
        if (storedUserId && storedUsername) {
            setUser({ userId: storedUserId, username: storedUsername });
        }
    }, []);

    const logout = () => {
        localStorage.removeItem('user_id');
        localStorage.removeItem('username');
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, setUser, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
