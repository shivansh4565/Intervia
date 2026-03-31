import { initializeApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    setPersistence,
    browserLocalPersistence
} from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "intervia-48215.firebaseapp.com",
    projectId: "intervia-48215",
    storageBucket: "intervia-48215.firebasestorage.app",
    messagingSenderId: "825009941269",
    appId: "1:825009941269:web:775b1c771cc9eeca40171c",
    measurementId: "G-G41N87JS1Z"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

// 🔥 ADD THIS (VERY IMPORTANT)
setPersistence(auth, browserLocalPersistence)
    .then(() => {
        console.log("🔥 Firebase persistence enabled");
    })
    .catch((error) => {
        console.log("Persistence error:", error);
    });

const provider = new GoogleAuthProvider();

export { auth, provider };