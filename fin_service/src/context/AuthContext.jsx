import { createContext, useContext, useEffect, useState } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile 
} from "firebase/auth";
import { auth } from "../firebase/config";

const GUEST_FLAG_KEY = "finsage_is_guest_mode";
const GUEST_MOCK_USER = {
  uid: "guest",
  email: "guest.demo@finsage.ai",
  displayName: "Guest Explorer",
  isAnonymous: true,
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isGuest, setIsGuest] = useState(() => {
    return localStorage.getItem(GUEST_FLAG_KEY) === "true";
  });
  const [loading, setLoading] = useState(true);

  function signup(email, password) {
    setIsGuest(false);
    localStorage.removeItem(GUEST_FLAG_KEY);
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email, password) {
    setIsGuest(false);
    localStorage.removeItem(GUEST_FLAG_KEY);
    return signInWithEmailAndPassword(auth, email, password);
  }

  function enterGuestMode() {
    setIsGuest(true);
    localStorage.setItem(GUEST_FLAG_KEY, "true");
  }

  async function logout() {
    setIsGuest(false);
    localStorage.removeItem(GUEST_FLAG_KEY);
    if (firebaseUser) {
      await signOut(auth);
    }
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  function updateUserProfile(displayName, photoURL) {
    if (!firebaseUser) return Promise.resolve();
    return updateProfile(auth.currentUser, {
      displayName,
      photoURL,
    });
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        setIsGuest(false);
        localStorage.removeItem(GUEST_FLAG_KEY);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const currentUser = firebaseUser || (isGuest ? GUEST_MOCK_USER : null);

  const value = {
    currentUser,
    isGuestMode: isGuest && !firebaseUser,
    signup,
    login,
    logout,
    enterGuestMode,
    resetPassword,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}