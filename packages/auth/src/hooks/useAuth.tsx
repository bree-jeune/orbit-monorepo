import { useState, useEffect, useMemo } from 'react';
import { OrbitAuthService } from '../FirebaseService';
import { AuthConfig, OrbitUser, SyncOptions } from '../types';

export function useAuth(config: AuthConfig) {
    const authService = useMemo(() => new OrbitAuthService(config), [config]);
    const [user, setUser] = useState<OrbitUser | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        const unsubscribe = authService.onUserChange((newUser) => {
            setUser(newUser);
        });
        return unsubscribe;
    }, [authService]);

    const syncState = async <T,>(data: T, options: SyncOptions) => {
        setIsSyncing(true);
        try {
            await authService.syncState(data, options);
        } finally {
            setIsSyncing(false);
        }
    };

    const subscribeToState = <T,>(options: SyncOptions, callback: (data: T) => void) => {
        return authService.subscribeToState(options, callback);
    };

    return {
        user,
        isSyncing,
        syncState,
        subscribeToState,
        userId: authService.getUserId()
    };
}
