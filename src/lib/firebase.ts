import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD2VBy-IQp11U3tk205Ep_VJhqaAqr4zTY",
  authDomain: "campus-platform-04.firebaseapp.com",
  projectId: "campus-platform-04",
  storageBucket: "campus-platform-04.firebasestorage.app",
  messagingSenderId: "904037520232",
  appId: "1:904037520232:web:fb0b3e39fa0dc3edf97cdd"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
