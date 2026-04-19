import { useEffect, useMemo, useState } from "react";

const LAUNCHES_URL = "https://api.spacexdata.com/v5/launches";
const DEFAULT_PATCH =
  "https://images2.imgbox.com/a9/9a/NXVkTZCE_o.png";

function formatDate(dateValue) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(dateValue));
}

function getLaunchYear(launch) {
  return new Date(launch.date_utc).getFullYear();
}

function App() {
  const [launches, setLaunches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadLaunches() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await fetch(LAUNCHES_URL);

        if (!response.ok) {
          throw new Error("SpaceX request failed.");
        }

        const data = await response.json();
        const sortedLaunches = data.sort(
          (first, second) => new Date(second.date_utc) - new Date(first.date_utc)
        );

        setLaunches(sortedLaunches);
      } catch (error) {
        setErrorMessage("발사 기록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setIsLoading(false);
      }
    }

    loadLaunches();
  }, []);

  const stats = useMemo(() => {
    const total = launches.length;
    const success = launches.filter((launch) => launch.success).length;
    const successRate = total > 0 ? Math.round((success / total) * 100) : 0;
    const latestLaunch = launches[0];

    return {
      total,
      successRate,
      latestDate: latestLaunch ? formatDate(latestLaunch.date_utc) : "-"
    };
  }, [launches]);

  const launchesByYear = useMemo(() => {
    const yearMap = launches.reduce((accumulator, launch) => {
      const year = getLaunchYear(launch);
      accumulator[year] = (accumulator[year] || 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(yearMap)
      .map(([year, count]) => ({ year, count }))
      .sort((first, second) => Number(first.year) - Number(second.year));
  }, [launches]);

  const maxYearCount = Math.max(...launchesByYear.map((item) => item.count), 1);

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-4 inline-flex rounded-md border border-green-300/30 bg-green-300/10 px-4 py-2 text-sm font-bold text-green-200">
            SpaceX API
          </p>

          <h1 className="text-4xl font-black leading-tight sm:text-6xl">
            SpaceX 발사 기록
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-300 sm:text-lg">
            전체 발사 기록을 카드 리스트와 KPI, 연도별 막대 차트로 확인하세요.
          </p>
        </div>

        {isLoading && (
          <div className="rounded-md border border-neutral-800 bg-neutral-950 px-6 py-10 text-center text-neutral-300">
            발사 기록을 불러오는 중입니다...
          </div>
        )}

        {errorMessage && (
          <div className="rounded-md border border-red-400/40 bg-red-500/10 px-6 py-5 text-center font-semibold text-red-200">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && (
          <>
            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <article className="rounded-md border border-neutral-800 bg-neutral-950 p-5">
                <p className="text-sm font-bold text-neutral-400">총 발사 수</p>
                <p className="mt-2 text-4xl font-black text-white">
                  {stats.total}
                </p>
              </article>

              <article className="rounded-md border border-neutral-800 bg-neutral-950 p-5">
                <p className="text-sm font-bold text-neutral-400">성공률</p>
                <p className="mt-2 text-4xl font-black text-green-300">
                  {stats.successRate}%
                </p>
              </article>

              <article className="rounded-md border border-neutral-800 bg-neutral-950 p-5">
                <p className="text-sm font-bold text-neutral-400">
                  최근 발사일
                </p>
                <p className="mt-2 text-4xl font-black text-white">
                  {stats.latestDate}
                </p>
              </article>
            </div>

            <section className="mb-8 rounded-md border border-neutral-800 bg-neutral-950 p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="text-2xl font-black">연도별 발사 횟수</h2>
                <p className="text-sm font-bold text-neutral-500">
                  {launchesByYear.length} years
                </p>
              </div>

              <div className="flex h-72 items-end gap-2 overflow-x-auto pb-2">
                {launchesByYear.map((item) => (
                  <div
                    key={item.year}
                    className="flex min-w-10 flex-1 flex-col items-center justify-end gap-2"
                  >
                    <span className="text-xs font-black text-green-200">
                      {item.count}
                    </span>
                    <div
                      className="w-full rounded-md bg-green-400"
                      style={{
                        height: `${Math.max(
                          (item.count / maxYearCount) * 210,
                          8
                        )}px`
                      }}
                    />
                    <span className="-rotate-45 text-xs font-bold text-neutral-500">
                      {item.year}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-2xl font-black">Launch List</h2>
                <p className="text-sm font-bold text-neutral-500">
                  {launches.length} missions
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {launches.map((launch) => {
                  const patch =
                    launch.links.patch.small ||
                    launch.links.patch.large ||
                    DEFAULT_PATCH;
                  const wasSuccessful = launch.success === true;

                  return (
                    <article
                      key={launch.id}
                      className="rounded-md border border-neutral-800 bg-neutral-950 p-5 shadow-lg shadow-black/30 transition hover:-translate-y-1 hover:border-green-300/50"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-neutral-900 p-2">
                          <img
                            src={patch}
                            alt={`${launch.name} mission patch`}
                            className="h-full w-full object-contain"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-xl font-black">
                            {launch.name}
                          </h3>
                          <p className="mt-1 text-sm font-semibold text-neutral-400">
                            {formatDate(launch.date_utc)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-3">
                        <span className="text-sm font-bold text-neutral-500">
                          Status
                        </span>
                        <span
                          className={`rounded-md px-3 py-1 text-sm font-black ${
                            wasSuccessful
                              ? "bg-green-400/15 text-green-300"
                              : "bg-red-400/15 text-red-300"
                          }`}
                        >
                          {wasSuccessful ? "성공" : "실패"}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}

export default App;
