import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
			if (firebaseUser) {
				const ref = doc(db, "users", firebaseUser.uid);
				const snap = await getDoc(ref);

				if (snap.exists()) {
					setUser({
						uid: firebaseUser.uid,
						email: firebaseUser.email,
						...snap.data(), // name, role etc
					});
				}
			} else {
				setUser(null);
			}
			setLoading(false);
		});

		return () => unsub();
	}, []);

	const logout = async () => {
		await signOut(auth);
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, logout, loading }}>
			{!loading && children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);