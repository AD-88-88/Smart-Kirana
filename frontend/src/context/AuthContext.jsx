import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext(null);

// Staff log in with a short Staff ID + 4-6 digit PIN instead of an email -
// far friendlier for non-tech-savvy counter staff. Under the hood this maps
// to a Firebase Auth email/password account (staffId@smartkirana.local),
// which the owner creates once per staff member from Settings.
function toInternalEmail(staffId) {
  return `${staffId.trim().toLowerCase()}@smartkirana.local`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = still checking, null = logged out
  const [role, setRole] = useState('staff');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Force refresh to ensure we get the latest custom claims (like 'role: owner')
        const tokenResult = await firebaseUser.getIdTokenResult(true);
        setRole(tokenResult.claims.role || 'staff');
      } else {
        setRole('staff');
      }
    });
    return unsub;
  }, []);

  async function login(staffId, pin) {
    await signInWithEmailAndPassword(auth, toInternalEmail(staffId), pin);
  }

  async function logout() {
    await signOut(auth);
  }

  async function getToken() {
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken();
  }

  return (
    <AuthContext.Provider value={{ user, role, login, logout, getToken, loading: user === undefined }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
