import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, Firestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, User, Auth } from 'firebase/auth';
import { AuthConfig, OrbitUser, SyncOptions } from './types';

export class OrbitAuthService {
    private app: FirebaseApp | null = null;
    private db: Firestore | null = null;
    private auth: Auth | null = null;
    private currentUser: User | null = null;

    constructor(config: AuthConfig) {
        if (getApps().length === 0) {
            this.app = initializeApp(config);
            this.db = getFirestore(this.app);
            this.auth = getAuth(this.app);
            this.initAuth();
        } else {
            this.app = getApps()[0];
            this.db = getFirestore(this.app);
            this.auth = getAuth(this.app);
        }
    }

    private initAuth() {
        if (!this.auth) return;

        signInAnonymously(this.auth).catch(console.error);

        onAuthStateChanged(this.auth, (user) => {
            this.currentUser = user;
        });
    }

    public onUserChange(callback: (user: OrbitUser | null) => void) {
        if (!this.auth) return () => { };
        return onAuthStateChanged(this.auth, (user) => {
            if (user) {
                callback({
                    uid: user.uid,
                    isPro: false, // Default for now, can be fetched from sub
                    tier: 'free'
                });
            } else {
                callback(null);
            }
        });
    }

    public async syncState<T>(data: T, options: SyncOptions) {
        if (!this.db || !this.currentUser) return;
        try {
            await setDoc(doc(this.db, options.collection, this.currentUser.uid), {
                data,
                updatedAt: new Date().toISOString()
            }, { merge: options.merge ?? true });
        } catch (e) {
            console.warn('[OrbitAuth] Sync failed', e);
        }
    }

    public subscribeToState<T>(options: SyncOptions, callback: (data: T) => void) {
        if (!this.db || !this.auth) return () => { };

        const setupListener = (uid: string) => {
            return onSnapshot(doc(this.db!, options.collection, uid), (snapshot) => {
                const data = snapshot.data();
                if (data && data.data) {
                    callback(data.data as T);
                }
            });
        };

        if (this.currentUser) {
            return setupListener(this.currentUser.uid);
        }

        const unsubscribeAuth = onAuthStateChanged(this.auth, (user) => {
            if (user) {
                setupListener(user.uid);
            }
        });

        return unsubscribeAuth;
    }

    public getUserId() {
        return this.currentUser?.uid || null;
    }
}
