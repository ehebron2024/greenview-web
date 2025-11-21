// Import the functions you need from the SDKs you want to use
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Your web app's Firebase configuration
// (Replace with your actual configuration for renovation-f4744)
const firebaseConfig = {
    apiKey: "AIzaSyATPDMrOfa_4vYZRCfa3BPLy93_xLAvRaQ",
    authDomain: "renovation-f4744.firebaseapp.com",
    projectId: "renovation-f4744",
    storageBucket: "renovation-f4744.firebasestorage.app",
    messagingSenderId: "960677509876",
    appId: "1:960677509876:web:7e9677e322ec8698c27ca1",
    measurementId: "G-QPDS0400J3"
  };



// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db: Firestore = getFirestore(app);

const auth: Auth = getAuth(app);
const storage: FirebaseStorage = getStorage(app);

// Export the initialized services so you can use them throughout your app

export { app, db, auth, storage }; // If you initialized other services
