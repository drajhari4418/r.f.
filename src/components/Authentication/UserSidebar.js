import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import { Avatar, Button } from "@material-ui/core";
import { CryptoState } from "../../CryptoContext";
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebase";
import { numberWithCommas } from "../CoinsTable";
import { AiFillDelete } from "react-icons/ai";
import { doc, setDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

const useStyles = makeStyles({
  container: {
    width: 350,
    padding: 25,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    fontFamily: "monospace",
  },
  profile: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    height: "92%",
  },
  logout: {
    height: "8%",
    width: "100%",
    backgroundColor: "#EEBC1D",
    marginTop: 20,
  },
  picture: {
    width: 200,
    height: 200,
    cursor: "pointer",
    backgroundColor: "#EEBC1D",
    objectFit: "contain",
  },
  watchlist: {
    flex: 1,
    minHeight: 120,
    width: "100%",
    backgroundColor: "grey",
    borderRadius: 10,
    padding: 15,
    paddingTop: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    overflowY: "scroll",
  },
  coin: {
    padding: 10,
    borderRadius: 5,
    color: "black",
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#EEBC1D",
    boxShadow: "0 0 3px black",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 4,
  },
  cartItem: {
    width: "100%",
    backgroundColor: "#262a30",
    borderRadius: 6,
    padding: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  cartActions: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    whiteSpace: "nowrap",
  },
});

export default function UserSidebar() {
  const classes = useStyles();
  const [state, setState] = React.useState({
    right: false,
  });
  const {
    user,
    setAlert,
    watchlist,
    coins,
    currency,
    symbol,
    cart,
    updateCartQuantity,
  } = CryptoState();

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      setState({ right: false });
      setAlert({
        open: true,
        type: "success",
        message: "You have been signed out.",
      });
    } catch (error) {
      setAlert({ open: true, type: "error", message: "Unable to sign out. Please try again." });
    }
  };

  const removeFromWatchlist = async (coin) => {
    const coinRef = doc(db, "watchlist", user.uid);
    try {
      await setDoc(
        coinRef,
        { coins: watchlist.filter((wish) => wish !== coin?.id) },
        { merge: true }
      );

      setAlert({
        open: true,
        message: `${coin.name} Removed from the Watchlist !`,
        type: "success",
      });
    } catch (error) {
      setAlert({
        open: true,
        message: error.message,
        type: "error",
      });
    }
  };

  return (
    <div>
      {["right"].map((anchor) => (
        <React.Fragment key={anchor}>
          <Avatar
            onClick={toggleDrawer(anchor, true)}
            style={{
              height: 38,
              width: 38,
              marginLeft: 15,
              cursor: "pointer",
              backgroundColor: "#EEBC1D",
            }}
            src={user.photoURL}
            alt={user.displayName || user.email}
          />
          <Drawer
            anchor={anchor}
            open={state[anchor]}
            onClose={toggleDrawer(anchor, false)}
          >
            <div className={classes.container}>
              <div className={classes.profile}>
                <Avatar
                  className={classes.picture}
                  src={user.photoURL}
                  alt={user.displayName || user.email}
                />
                <span
                  style={{
                    width: "100%",
                    fontSize: 25,
                    textAlign: "center",
                    fontWeight: "bolder",
                    wordWrap: "break-word",
                  }}
                >
                  {user.displayName || user.email}
                </span>
                <div className={classes.watchlist}>
                  <span className={classes.sectionTitle}>
                    Watchlist
                  </span>
                  {coins.map((coin) => {
                    if (watchlist.includes(coin.id))
                      return (
                        <Link
                          key={coin.id}
                          className={classes.coin}
                          to={`/coins/${coin.id}`}
                          onClick={() => setState({ right: false })}
                        >
                          <span>{coin.name}</span>
                          <span style={{ display: "flex", gap: 8 }}>
                            {symbol}{" "}
                            {numberWithCommas(coin.current_price.toFixed(2))}
                          </span>
                          <AiFillDelete
                            style={{ cursor: "pointer" }}
                            fontSize="16"
                            onClick={(event) => {
                              event.preventDefault();
                              removeFromWatchlist(coin);
                            }}
                          />
                        </Link>
                      );
                    else return <></>;
                  })}
                  {!watchlist.length && <span>Your watchlist is empty.</span>}
                  <span className={classes.sectionTitle}>Paper portfolio cart</span>
                  {cart.map((item) => {
                    const liveCoin = coins.find((coin) => coin.id === item.id);
                    const price = item.currency === (currency || "INR")
                      ? liveCoin?.current_price || item.price || 0
                      : item.price || 0;
                    const itemSymbol = item.currency === "USD" ? "$" : "₹";
                    return (
                      <div className={classes.cartItem} key={item.id}>
                        <Link
                          to={`/coins/${item.id}`}
                          onClick={() => setState({ right: false })}
                        >
                          {item.name} ({item.symbol?.toUpperCase()})
                        </Link>
                        <span className={classes.cartActions}>
                          {itemSymbol}{numberWithCommas((price * item.quantity).toFixed(2))}
                          <Button
                            size="small"
                            aria-label={`Remove one ${item.name}`}
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          >−</Button>
                          <span>{item.quantity}</span>
                          <Button
                            size="small"
                            aria-label={`Add one ${item.name}`}
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          >+</Button>
                        </span>
                      </div>
                    );
                  })}
                  {!cart.length && <span>No coins in your paper portfolio cart.</span>}
                </div>
              </div>
              <Button
                variant="contained"
                className={classes.logout}
                onClick={logOut}
              >
                Log Out
              </Button>
            </div>
          </Drawer>
        </React.Fragment>
      ))}
    </div>
  );
}
