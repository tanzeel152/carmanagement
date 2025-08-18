"use client"
import { useContext, useEffect, useState, createContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../utilis/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // ✅ Fetch Role from Firestore
        const userDoc = await getDoc(doc(db, "Users", currentUser.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role); // Store role
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, setUser, setRole }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
