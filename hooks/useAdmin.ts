import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("🔐 useAdmin: Auth state changed");
      
      if (user) {
        console.log("👤 useAdmin: User found:", user.email);
        
        try {
          // Get the ID token result which contains custom claims
          const idTokenResult = await user.getIdTokenResult();
          
          console.log("🎫 useAdmin: Token claims:", idTokenResult.claims);
          console.log("🔑 useAdmin: Admin claim:", idTokenResult.claims.admin);
          console.log("🔑 useAdmin: Admin type:", typeof idTokenResult.claims.admin);
          
          // Check if admin claim exists and is true
          const adminStatus = idTokenResult.claims.admin === true;
          
          console.log("✅ useAdmin: Setting isAdmin to:", adminStatus);
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error("❌ useAdmin: Error getting token:", error);
          setIsAdmin(false);
        }
      } else {
        console.log("❌ useAdmin: No user found");
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { isAdmin, loading };
}