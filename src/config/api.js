const coinGeckoBaseUrl = (
  process.env.REACT_APP_COINGECKO_API_BASE_URL ||
  "https://api.coingecko.com/api/v3"
).replace(/\/$/, "");

const coinGeckoApiKey = process.env.REACT_APP_COINGECKO_DEMO_API_KEY;

// The public endpoint works without a key for low-volume use. A demo key can
// be supplied through .env without placing it in the source code.
export const coinGeckoRequestConfig = coinGeckoApiKey
  ? { headers: { "x-cg-demo-api-key": coinGeckoApiKey } }
  : {};

export const CoinList = (currency) => {
  const params = new URLSearchParams({
    vs_currency: currency.toLowerCase(),
    order: "market_cap_desc",
    per_page: "100",
    page: "1",
    sparkline: "false",
  });
  return `${coinGeckoBaseUrl}/coins/markets?${params.toString()}`;
};

export const SingleCoin = (id) =>
  `${coinGeckoBaseUrl}/coins/${encodeURIComponent(id)}`;

export const HistoricalChart = (id, days = 365, currency) => {
  const params = new URLSearchParams({
    vs_currency: currency.toLowerCase(),
    days: String(days),
  });
  return `${coinGeckoBaseUrl}/coins/${encodeURIComponent(id)}/market_chart?${params.toString()}`;
};

export const TrendingCoins = (currency) =>
  `${coinGeckoBaseUrl}/coins/markets?vs_currency=${currency.toLowerCase()}&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`;
