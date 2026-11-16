# Firebase setup for Crypto Add

The app already uses Firebase Authentication and Cloud Firestore. Firebase Authentication stores account records in **Authentication → Users**; passwords are validated by Firebase and are never written to Firestore. The app stores per-user watchlists at `watchlist/{uid}`, and the paper portfolio cart at `cart/{uid}`. Public coin reviews live at `coinReviews/{coinId}/reviews/{reviewId}`.

## Check the existing Firebase project

The current web configuration defaults to the Firebase project `auth-react-ba19b`. Confirm this is the project you own in the Firebase Console. If your project has a different ID, add its web app values to the Vercel environment variables shown in `.env.example`.

1. In Firebase Console, open **Authentication → Sign-in method** and enable **Email/Password**. Enable Google only if you want Google sign-in.
2. Under **Authentication → Settings → Authorized domains**, add `r-f.vercel.app` and any custom domain you use.
3. Open **Firestore Database**. If a database already exists, keep it. Otherwise create the default database in production mode. Creating or selecting the database itself requires access to the Firebase Console account.
4. Publish the rules in `firestore.rules` (Firestore → Rules). They allow each signed-in user to access only their own watchlist and cart, while reviews are readable by everyone and can only be created by the signed-in author.
5. In Vercel → Project → Settings → Environment Variables, add the Firebase values from your Firebase web app. Add `REACT_APP_COINGECKO_DEMO_API_KEY` to reduce CoinGecko rate limits. Optionally add `REACT_APP_SUPPORT_EMAIL` if you want to show a support contact address. Redeploy after changing environment variables.

## Fixing `auth/wrong-password`

That response comes from Firebase Auth when the password does not match the account or the client is talking to a different Firebase project than the one containing the account. Use **Forgot password?** in the login form to send Firebase's reset link, then check that Vercel uses the same Firebase project as the account. Do not create a Firestore password table; it cannot repair a Firebase password and would expose credentials.

## Email behavior

The coin details page can open the visitor's email app with a prepared coin link. It does not send mail from the site by itself. Automated receipts or newsletters need a server-side email provider and verified sender configuration; do not put SMTP credentials in `REACT_APP_*` variables because those are shipped to the browser.

## Cart behavior

The cart is a saved paper portfolio list for tracking coin quantities and indicative prices. It does not buy, sell, or transfer cryptocurrency and has no checkout/payment integration.
