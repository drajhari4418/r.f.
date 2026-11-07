const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDAfgH7sIJZJpFZPplP4tlEqmOp_d5zhgM",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "auth-react-ba19b.firebaseapp.com",
  databaseURL:
    process.env.REACT_APP_FIREBASE_DATABASE_URL ||
    "https://auth-react-ba19b-default-rtdb.firebaseio.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "auth-react-ba19b",
  storageBucket:
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "auth-react-ba19b.appspot.com",
  messagingSenderId:
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "442337376656",
  appId:
    process.env.REACT_APP_FIREBASE_APP_ID ||
    "1:442337376656:web:1639f1c7769428b937db15",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-8F0WNDJSW3",
};

export default firebaseConfig;
