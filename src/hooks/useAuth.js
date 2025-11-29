import {useState, useEffect, useRef} from 'react';
import { 
    initializeApp 
} from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    signInAnonymously, 
    signInWithCustomToken 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const appId = firebaseConfig.projectId || 'default-app-id';
const initialAuthToken = null;

export const useAuth = () => {
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(null);
    const [error, setError] = useState(null);

    const authRef = useRef(null);
    const dbRef = useRef(null);

     useEffect(() => {
         if(!firebaseConfig.apiKey || !firebaseConfig.projectId){
                 setError("Firebase configuration is missing. Add VITE_FIREBASE_* to .env.local")
                 setIsAuthReady(true);
                 return;
             }
        try{
            const app = initializeApp(firebaseConfig);
            authRef.current= getAuth(app);
            dbRef.current = getFirestore(app);

            const handleAuth = async () => {
                if(initialAuthToken){
                    await signInWithCustomToken(authRef.current, initialAuthToken);
                }else{
                        await signInAnonymously(authRef.current);
                }
            };

            const unsubscribe = onAuthStateChanged(authRef.current, (user) => {
                if(user){
                    setUserId(user.uid);
                }else{
                    if(!authRef.current.currentUser){
                        handleAuth().catch(e => {
                            console.error("Authentication Failed:", e);
                            setError("Authentication failed.");
                        });
                    }
                }
                setIsAuthReady(true);
            });

            return () => unsubscribe();

        }catch(e){
            console.error("Initialization Error:", e);
            setError(`Initialization failed: ${e.message}`);
            setIsAuthReady(true);

        }   
    },[])

    return {
        userId,
        isAuthReady,
        error,
        db: dbRef.current,
        auth: authRef.current,
        appId,
    };
};