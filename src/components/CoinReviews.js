import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography,
} from "@material-ui/core";
import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { CryptoState } from "../CryptoContext";

const CoinReviews = ({ coin }) => {
  const { user, setAlert } = CryptoState();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const reviewsQuery = query(
      collection(db, "coinReviews", coin.id, "reviews"),
      orderBy("createdAt", "desc"),
      limit(30)
    );

    const unsubscribe = onSnapshot(
      reviewsQuery,
      (snapshot) => {
        setReviews(snapshot.docs.map((review) => ({ id: review.id, ...review.data() })));
        setLoading(false);
      },
      () => {
        setLoading(false);
        setAlert({
          open: true,
          message: "Reviews could not be loaded. Check the Firestore rules and try again.",
          type: "error",
        });
      }
    );

    return unsubscribe;
  }, [coin.id, setAlert]);

  const submitReview = async (event) => {
    event.preventDefault();
    const cleanComment = comment.trim();
    if (!user) {
      setAlert({ open: true, message: "Sign in to leave a review.", type: "info" });
      return;
    }
    if (!cleanComment) {
      setAlert({ open: true, message: "Add a short comment before submitting.", type: "info" });
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "coinReviews", coin.id, "reviews"), {
        userId: user.uid,
        displayName: user.displayName || user.email || "Crypto Add member",
        rating,
        comment: cleanComment,
        createdAt: serverTimestamp(),
      });
      setComment("");
      setRating(5);
      setAlert({ open: true, message: "Your review has been posted.", type: "success" });
    } catch (error) {
      setAlert({
        open: true,
        message: "Your review could not be saved. Check the Firestore rules and try again.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" style={{ color: "white", padding: "24px 16px 48px" }}>
      <Typography variant="h5" style={{ fontWeight: 700, marginBottom: 16 }}>
        Community reviews for {coin.name}
      </Typography>
      {user ? (
        <Box component="form" onSubmit={submitReview} mb={3}>
          <Typography component="label" display="block" style={{ marginBottom: 8 }}>
            Your rating: {"★".repeat(rating)}{"☆".repeat(5 - rating)}
          </Typography>
          <select
            aria-label="Your rating"
            value={rating}
            onChange={(event) => setRating(Number(event.target.value))}
            style={{ padding: 8, marginBottom: 12 }}
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>{value} star{value === 1 ? "" : "s"}</option>
            ))}
          </select>
          <TextField
            variant="outlined"
            label="Share your experience"
            multiline
            minRows={3}
            fullWidth
            value={comment}
            onChange={(event) => setComment(event.target.value.slice(0, 500))}
            helperText={`${comment.length}/500 characters`}
            inputProps={{ maxLength: 500 }}
          />
          <Button
            type="submit"
            disabled={submitting}
            variant="contained"
            style={{ marginTop: 12, backgroundColor: "#EEBC1D" }}
          >
            {submitting ? "Posting…" : "Post review"}
          </Button>
        </Box>
      ) : (
        <Typography style={{ marginBottom: 20, color: "#b6b8bd" }}>
          Sign in to share a review. Reviews are public and tied to your account.
        </Typography>
      )}

      {loading ? (
        <CircularProgress style={{ color: "#EEBC1D" }} size={28} />
      ) : reviews.length ? (
        reviews.map((review) => (
          <Box
            key={review.id}
            mb={1.5}
            p={2}
            style={{ backgroundColor: "#202328", borderRadius: 8 }}
          >
            <Typography style={{ color: "#EEBC1D", fontWeight: 700 }}>
              {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
            </Typography>
            <Typography style={{ fontWeight: 600, marginTop: 4 }}>
              {review.displayName}
            </Typography>
            <Typography style={{ color: "#d0d2d6", whiteSpace: "pre-wrap", marginTop: 6 }}>
              {review.comment}
            </Typography>
          </Box>
        ))
      ) : (
        <Typography style={{ color: "#b6b8bd" }}>No reviews yet. Be the first to share one.</Typography>
      )}
    </Container>
  );
};

export default CoinReviews;
