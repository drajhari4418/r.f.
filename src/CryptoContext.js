import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import axios from "axios";
import { CoinList, coinGeckoRequestConfig } from "./config/api";
import { onSnapshot, doc } from "firebase/firestore";
import { setDoc } from "firebase/firestore";

const Crypto = createContext();

const CryptoContext = ({ children }) => {
  const [currency, setCurrency] = useState("INR");
  const [symbol, setSymbol] = useState("₹");
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    type: "success",
  });
  const [user, setUser] = useState(null);
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (!user) {
      setWatchlist([]);
      setCart([]);
      return undefined;
    }

    const coinRef = doc(db, "watchlist", user.uid);
    const unsubscribe = onSnapshot(
      coinRef,
      (coin) => {
        setWatchlist(coin.exists() ? coin.data().coins || [] : []);
      },
      (error) => {
        setAlert({
          open: true,
          message: error.message,
          type: "error",
        });
      }
    );

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!user) return undefined;

    const cartRef = doc(db, "cart", user.uid);
    const unsubscribe = onSnapshot(
      cartRef,
      (cartDocument) => {
        setCart(cartDocument.exists() ? cartDocument.data().items || [] : []);
      },
      () => {
        setAlert({
          open: true,
          message: "Your saved cart could not be loaded. Check the Firestore rules and try again.",
          type: "error",
        });
      }
    );

    return unsubscribe;
  }, [user]);

  const saveCart = async (nextCart) => {
    if (!user) return false;

    try {
      await setDoc(doc(db, "cart", user.uid), { items: nextCart });
      setCart(nextCart);
      return true;
    } catch (error) {
      setAlert({
        open: true,
        message: "Your cart could not be saved. Check the Firestore rules and try again.",
        type: "error",
      });
      return false;
    }
  };

  const addToCart = async (coin) => {
    if (!user || !coin) return false;

    const existingItem = cart.find((item) => item.id === coin.id);
    const item = {
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      image: coin.image?.large || coin.image,
      price:
        coin.current_price ||
        coin.market_data?.current_price?.[currency.toLowerCase()] ||
        0,
      currency,
      quantity: existingItem ? existingItem.quantity + 1 : 1,
    };
    const nextCart = existingItem
      ? cart.map((savedItem) => (savedItem.id === coin.id ? item : savedItem))
      : [...cart, item];

    const saved = await saveCart(nextCart);
    if (saved) {
      setAlert({
        open: true,
        message: `${coin.name} added to your paper portfolio cart. No purchase was made.`,
        type: "success",
      });
    }
    return saved;
  };

  const updateCartQuantity = async (coinId, quantity) => {
    const nextCart = quantity <= 0
      ? cart.filter((item) => item.id !== coinId)
      : cart.map((item) =>
          item.id === coinId ? { ...item, quantity: Math.min(quantity, 1000000) } : item
        );
    return saveCart(nextCart);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });

    return unsubscribe;
  }, []);

  const fetchCoins = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(CoinList(currency), coinGeckoRequestConfig);
      setCoins(data);
    } catch (error) {
      setCoins([]);
      setAlert({
        open: true,
        message: "Unable to load cryptocurrency prices. Please try again shortly.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currency === "INR") setSymbol("₹");
    else if (currency === "USD") setSymbol("$");

    fetchCoins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency]);

  return (
    <Crypto.Provider
      value={{
        currency,
        setCurrency,
        symbol,
        alert,
        setAlert,
        user,
        coins,
        loading,
        watchlist,
        cart,
        addToCart,
        updateCartQuantity,
      }}
    >
      {children}
    </Crypto.Provider>
  );
};

export default CryptoContext;

export const CryptoState = () => {
  return useContext(Crypto);
};
