export interface OrbitUser {
    uid: string;
    isPro: boolean;
    tier: 'free' | 'pro';
    lastSync?: string;
}

export interface AuthConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
}

export interface SyncOptions {
    collection: string;
    merge?: boolean;
}
