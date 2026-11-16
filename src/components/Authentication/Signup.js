import { Box, Button, TextField } from "@material-ui/core";
import { useState } from "react";
import { CryptoState } from "../../CryptoContext";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";

function signupErrorMessage(error) {
  switch (error.code) {
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/email-already-in-use":
      return "An account already exists for this email. Log in or reset your password.";
    case "auth/weak-password":
      return "Choose a password with at least 6 characters.";
    case "auth/operation-not-allowed":
      return "Email and password sign-in is disabled in Firebase Authentication settings.";
    default:
      return "We couldn't create your account. Please try again.";
  }
}

const Signup = ({ handleClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { setAlert } = CryptoState();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password || !confirmPassword) {
      setAlert({ open: true, message: "Please fill in all fields.", type: "error" });
      return;
    }
    if (password.length < 6) {
      setAlert({ open: true, message: "Choose a password with at least 6 characters.", type: "error" });
      return;
    }
    if (password !== confirmPassword) {
      setAlert({
        open: true,
        message: "Passwords do not match",
        type: "error",
      });
      return;
    }

    try {
      setSubmitting(true);
      const result = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        password
      );
      setAlert({
        open: true,
        message: `Account created. Welcome ${result.user.email}`,
        type: "success",
      });

      handleClose();
    } catch (error) {
      setAlert({
        open: true,
        message: signupErrorMessage(error),
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      p={3}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <TextField
        variant="outlined"
        type="email"
        label="Enter Email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
      />
      <TextField
        variant="outlined"
        label="Enter Password"
        type="password"
        autoComplete="new-password"
        inputProps={{ minLength: 6 }}
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
      />
      <TextField
        variant="outlined"
        label="Confirm Password"
        type="password"
        autoComplete="new-password"
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        fullWidth
      />
      <Button
        variant="contained"
        size="large"
        style={{ backgroundColor: "#EEBC1D" }}
        type="submit"
        disabled={submitting}
      >
        {submitting ? "Creating account…" : "Sign Up"}
      </Button>
    </Box>
  );
};

export default Signup;
