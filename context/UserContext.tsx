"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export interface UserData {
  uid: string;
  email: string | null;
  name: string | null;
  number?: string;
  city?: string;
  createdAt?: Date;
  lastActivity?: Date;
}

interface UserContextType {
  user: FirebaseUser | null;
  userData: UserData | null;
  loading: boolean;
  refetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  userData: null,
  loading: true,
  refetchUser: async () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (currentUser: FirebaseUser) => {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserData({
          uid: currentUser.uid,
          email: userSnap.data().email,
          name: userSnap.data().name,
          number: userSnap.data().number,
          city: userSnap.data().city,
          createdAt: userSnap.data().createdAt,
          lastActivity: userSnap.data().lastActivity,
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const refetchUser = async () => {
    if (user) {
      await fetchUserData(user);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        await fetchUserData(currentUser);
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, userData, loading, refetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
