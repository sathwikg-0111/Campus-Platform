import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

interface CampusUser extends User {
  campusProfile?: any;
}

const AuthContext = createContext<{ user: CampusUser | null; loading: boolean }>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<CampusUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Listen to their profile in Firestore
        const unsubscribe = onSnapshot(doc(db, 'campusData', 'users'), (docSnap) => {
          if (docSnap.exists()) {
             const allUsers = docSnap.data().items || [];
             const profile = allUsers.find((u: any) => u.email === firebaseUser.email);
             setUser(Object.assign(firebaseUser, { campusProfile: profile }));
          } else {
             setUser(firebaseUser);
          }
          setLoading(false);
        });
        return () => unsubscribe();
      } else {
        setUser(null);
        setLoading(false);
      }
    });
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
