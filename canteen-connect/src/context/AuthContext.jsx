import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('canteen_user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (e) {
            console.error("Auth Load Error", e);
            return null;
        }
    });

    // Removed useEffect since we load synchronously now


    const login = async (role, credentials, isFaceLogin = false) => {
        try {
            if (isFaceLogin) {
                // Mock Face Logic usually handles on client or sends image to server
                // For now, we simulate success
                const userObj = {
                    id: credentials.id,
                    name: "Verified User",
                    role: 'user',
                    wallet: 0,
                    preferences: { diet: 'None', allergies: [] },
                    loyalty: { points: 0, totalSpent: 0, badge: 'Bronze', birthday: '' }
                };
                setUser(userObj);
                localStorage.setItem('canteen_user', JSON.stringify(userObj));
                return { success: true };
            }

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: credentials.id, pass: credentials.pass })
            });

            const data = await response.json();

            if (data.success) {
                // Check role if Admin access required
                if (role === 'admin' && data.user.role !== 'admin') {
                    return { success: false, message: 'Access Denied: Not an Admin' };
                }

                setUser(data.user);
                localStorage.setItem('canteen_user', JSON.stringify(data.user));
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error("Login Error:", error);
            return { success: false, message: 'Server Error' };
        }
    };

    const register = async (userDetails) => {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: userDetails.id,
                    name: userDetails.name,
                    pass: userDetails.pass
                })
            });

            const data = await response.json();

            if (data.success) {
                setUser(data.user);
                localStorage.setItem('canteen_user', JSON.stringify(data.user));
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error("Register Error:", error);
            return { success: false, message: 'Server Connection Failed' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('canteen_user');
    };

    const updateLocalWallet = (newBalance) => {
        setUser(prev => {
            const updated = { ...prev, wallet: newBalance };
            localStorage.setItem('canteen_user', JSON.stringify(updated));
            return updated;
        });
    };

    const updateUserPreferences = (newPrefs) => {
        setUser(prev => {
            const updated = { ...prev, preferences: newPrefs };
            localStorage.setItem('canteen_user', JSON.stringify(updated));
            return updated;
        });
    };

    const updateUserLoyalty = (newLoyalty) => {
        setUser(prev => {
            const updated = { ...prev, loyalty: newLoyalty };
            localStorage.setItem('canteen_user', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, updateLocalWallet, updateUserPreferences, updateUserLoyalty }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
