import React, { useState } from "react";
import { auth } from "../../lib/firebase"; // Ensure this file exists and exports 'auth'
import { createUserWithEmailAndPassword } from "firebase/auth";

const SignUpForm: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    setError(null); // Clear previous errors
    setSuccessMessage(null); // Clear previous success messages

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      // Call Firebase to create the user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // If successful, the user is automatically signed in.
      console.log(
        "User signed up and logged in successfully:",
        userCredential.user
      );
      setSuccessMessage(
        `Welcome, ${userCredential.user.email}! You're signed up and logged in.`
      );
      setEmail("");
      setPassword("");

      // Here you might redirect the user, update UI, etc.
    } catch (firebaseError: any) {
      // Catch Firebase-specific errors
      console.error(
        "Error signing up:",
        firebaseError.code,
        firebaseError.message
      );

      // Provide more user-friendly messages for common Firebase Auth errors
      switch (firebaseError.code) {
        case "auth/email-already-in-use":
          setError(
            "This email is already registered. Please use a different email or log in."
          );
          break;
        case "auth/invalid-email":
          setError(
            "The email address is not valid. Please enter a valid email."
          );
          break;
        case "auth/weak-password":
          setError("The password is too weak. Please use a stronger password.");
          break;
        default:
          setError(
            "An unknown error occurred during sign up. Please try again later."
          );
      }
    }
  };

  return (
    <form
      onSubmit={handleSignUp}
      style={{
        maxWidth: "400px",
        margin: "20px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h2>Sign Up</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", margin: "5px 0" }}
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", margin: "5px 0" }}
        />
      </div>
      <button
        type="submit"
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Sign Up
      </button>
    </form>
  );
};

export default SignUpForm;
