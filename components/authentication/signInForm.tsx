"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Import Next.js router
import { auth, db } from "@/lib/firebase"; // Ensure this file exists and exports 'auth' and 'db'
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// Add prop type for onSignInSuccess
interface SignInFormProps {
  onSignInSuccess?: (userId: string) => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onSignInSuccess }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const router = useRouter(); // Initialize Next.js router

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      // Call Firebase to sign in the user with email and password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // If successful, the user is signed in
      const userId = userCredential.user.uid; // Get the user's unique ID
      console.log("User signed in successfully:", userCredential.user);
      console.log("User ID:", userId); // Debugging log

      // Save user data to Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: userCredential.user.email,
        // ...other user data
      });

      setSuccessMessage(`Welcome back, ${userCredential.user.email}!`);
      setEmail("");
      setPassword("");

      // Call parent callback if provided
      if (onSignInSuccess) {
        onSignInSuccess(userId);
      }
      // Optionally, you can keep router.push here for fallback navigation
      router.push(`/userId/${userId}`);
    } catch (firebaseError: any) {
      // Handle Firebase errors
      console.error(
        "Error signing in:",
        firebaseError.code,
        firebaseError.message
      );

      switch (firebaseError.code) {
        case "auth/user-not-found":
          setError("No account found with this email. Please sign up first.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password. Please try again.");
          break;
        case "auth/invalid-credential":
          setError("Sorry, we can't find those account credentials.");
          break;
        case "auth/invalid-email":
          setError(
            "The email address is not valid. Please enter a valid email."
          );
          break;
        default:
          setError(
            "An unknown error occurred during sign in. Please try again later."
          );
      }
    }
  };

  return (
    <form
      onSubmit={handleSignIn}
      style={{
        maxWidth: "400px",
        margin: "20px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h2
        style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}
      >
        Sign In
      </h2>
      {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}
      {successMessage && (
        <p style={{ color: "green", marginBottom: "10px" }}>{successMessage}</p>
      )}
      <div style={{ marginBottom: "15px" }}>
        <label
          htmlFor="email"
          style={{ display: "block", marginBottom: "5px" }}
        >
          Email:
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            fontSize: "16px",
          }}
        />
      </div>
      <div style={{ marginBottom: "15px" }}>
        <label
          htmlFor="password"
          style={{ display: "block", marginBottom: "5px" }}
        >
          Password:
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            fontSize: "16px",
          }}
        />
      </div>
      <button
        type="submit"
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: "#013220",
          color: "#ffffff",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          transition: "background-color 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        Sign In
      </button>
    </form>
  );
};

export default SignInForm;
