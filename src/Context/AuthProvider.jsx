import React from 'react';
import { AuthContext } from './AuthContext';
import { useCurrentUser } from '../hooks/useCurrentUser';

const AuthProvider = ({ children }) => {
    const { data: user, isLoading, refetch } = useCurrentUser();

    const authInfo = {
        user,
        loading: isLoading,
        refetchUser: refetch,
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;