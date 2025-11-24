import React, { useState } from "react";
import { auth } from "../../lib/firebase"; // Ensure this file exists and exports 'auth'
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const SignUpForm: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setSuccessMessage(null);

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

      // If successful, the user is created
      console.log("User signed up successfully:", userCredential.user);
      setSuccessMessage(`Welcome, ${userCredential.user.email}!`);
      setEmail("");
      setPassword("");
    } catch (firebaseError: any) {
      // Handle Firebase errors
      console.error(
        "Error signing up:",
        firebaseError.code,
        firebaseError.message
      );

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
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h2
        style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}
      >
        Sign Up
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
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = "#016936";
          (e.target as HTMLButtonElement).style.boxShadow =
            "0 6px 10px rgba(0, 0, 0, 0.2)";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = "#013220";
          (e.target as HTMLButtonElement).style.boxShadow =
            "0 4px 6px rgba(0, 0, 0, 0.1)";
        }}
      >
        Sign Up
      </button>
    </form>
  );
};

export default SignUpForm;
