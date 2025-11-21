import React, { useState } from "react";
import { auth } from "../../lib/firebase"; // Ensure this file exists and exports 'auth'
import { signInWithEmailAndPassword } from "firebase/auth";

const SignInForm: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    setError(null); // Clear previous errors
    setSuccessMessage(null); // Clear previous success messages

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

      // If successful, the user is signed in.
      console.log("User signed in successfully:", userCredential.user);
      setSuccessMessage(`Welcome back, ${userCredential.user.email}!`);
      setEmail("");
      setPassword("");

      // Here you might redirect the user, update UI, etc.
    } catch (firebaseError: any) {
      // Catch Firebase-specific errors
      console.error(
        "Error signing in:",
        firebaseError.code,
        firebaseError.message
      );

      // Provide more user-friendly messages for common Firebase Auth errors
      switch (firebaseError.code) {
        case "auth/user-not-found":
          setError("No account found with this email. Please sign up first.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password. Please try again.");
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
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        textAlign: "left",
      }}
    >
      <label htmlFor="email" style={{ color: "#013220", fontWeight: "bold" }}>
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
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />
      <label
        htmlFor="password"
        style={{ color: "#013220", fontWeight: "bold" }}
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
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />
      <button
        type="submit"
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#013220",
          color: "#ffffff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Sign In
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
    </form>
  );
};

export default SignInForm;
