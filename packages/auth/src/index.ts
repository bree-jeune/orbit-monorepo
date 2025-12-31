export * from './types';
export * from './FirebaseService';

import { OrbitAuthService } from './FirebaseService';
import { AuthConfig } from './types';

let instance: OrbitAuthService | null = null;

export const getAuthService = (config?: AuthConfig) => {
    if (!instance && config) {
        instance = new OrbitAuthService(config);
    }
    return instance;
};
