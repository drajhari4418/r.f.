import { Box, Button, TextField } from "@material-ui/core";
import { useState } from "react";
import { CryptoState } from "../../CryptoContext";
import { auth } from "../../firebase";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";

function authErrorMessage(error) {
  switch (error.code) {
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email or password is incorrect. Use Forgot password to reset it.";
    case "auth/user-disabled":
      return "This account has been disabled. Contact support for help.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a few minutes, then try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "We couldn't sign you in. Please try again.";
  }
}

const Login = ({ handleClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { setAlert } = CryptoState();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      setAlert({
        open: true,
        message: "Please fill all the Fields",
        type: "error",
      });
      return;
    }

    try {
      setSubmitting(true);
      const result = await signInWithEmailAndPassword(
        auth,
        normalizedEmail,
        password
      );
      setAlert({
        open: true,
        message: `Welcome back, ${result.user.email}`,
        type: "success",
      });

      handleClose();
    } catch (error) {
      setAlert({
        open: true,
        message: authErrorMessage(error),
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setAlert({
        open: true,
        message: "Enter your email address first, then choose Forgot password.",
        type: "info",
      });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, normalizedEmail);
      setAlert({
        open: true,
        message: "If an account uses that email, Firebase has sent a password reset link.",
        type: "success",
      });
    } catch (error) {
      setAlert({
        open: true,
        message: authErrorMessage(error),
        type: "error",
      });
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
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
      />
      <Button
        variant="contained"
        size="large"
        type="submit"
        disabled={submitting}
        style={{ backgroundColor: "#EEBC1D" }}
      >
        {submitting ? "Signing in…" : "Login"}
      </Button>
      <Button type="button" onClick={handlePasswordReset} color="default">
        Forgot password?
      </Button>
    </Box>
  );
};

export default Login;
