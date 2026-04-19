import { useEffect, useState } from "react";

const COINS_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1 ? 2 : 6
  }).format(value);
}

function formatPercent(value) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function App() {
  const [coins, setCoins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadCoins() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await fetch(COINS_URL);

        if (!response.ok) {
          throw new Error("CoinGecko request failed.");
        }

        const data = await response.json();
        setCoins(data);
      } catch (error) {
        setErrorMessage("코인 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setIsLoading(false);
      }
    }

    loadCoins();
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 px-5 py-8 text-white sm:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="mb-4 inline-flex rounded-md border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-200">
            CoinGecko API
          </p>

          <h1 className="text-4xl font-black leading-tight sm:text-6xl">
            암호화폐 대시보드
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-300 sm:text-lg">
            코인 상위 20개를 가져와 가격과 등락률을 카드로 보여줍니다.
          </p>
        </div>

        {isLoading && (
          <div className="rounded-md border border-neutral-800 bg-neutral-900 px-6 py-10 text-center text-neutral-300">
            코인 데이터를 불러오는 중입니다...
          </div>
        )}

        {errorMessage && (
          <div className="rounded-md border border-red-400/40 bg-red-500/10 px-6 py-5 text-center font-semibold text-red-200">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {coins.map((coin) => {
              const change = coin.price_change_percentage_24h || 0;
              const isUp = change >= 0;

              return (
                <article
                  key={coin.id}
                  className="rounded-md border border-neutral-800 bg-neutral-900 p-5 shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:border-cyan-300/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="h-11 w-11 rounded-full bg-neutral-800"
                      />

                      <div>
                        <h2 className="font-black text-white">{coin.name}</h2>
                        <p className="text-sm font-bold uppercase text-neutral-500">
                          {coin.symbol}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm font-bold text-neutral-500">
                      #{coin.market_cap_rank}
                    </p>
                  </div>

                  <div className="mt-6">
                    <p className="text-sm font-semibold text-neutral-400">
                      Price
                    </p>
                    <p className="mt-1 text-2xl font-black">
                      {formatCurrency(coin.current_price)}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-neutral-400">
                      24h Change
                    </span>

                    <span
                      className={`rounded-md px-3 py-1 text-sm font-black ${
                        isUp
                          ? "bg-green-400/15 text-green-300"
                          : "bg-red-400/15 text-red-300"
                      }`}
                    >
                      {formatPercent(change)}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
