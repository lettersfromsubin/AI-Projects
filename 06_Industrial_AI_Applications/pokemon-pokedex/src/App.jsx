import { useEffect, useState } from "react";

const POKEMON_LIMIT = 20;
const MAX_STAT_VALUE = 150;

function formatPokemonName(name) {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadPokemon() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon?limit=${POKEMON_LIMIT}`
        );

        if (!response.ok) {
          throw new Error("Pokemon list request failed.");
        }

        const data = await response.json();
        const pokemonDetails = await Promise.all(
          data.results.map(async (pokemon) => {
            const detailResponse = await fetch(pokemon.url);

            if (!detailResponse.ok) {
              throw new Error(`${pokemon.name} request failed.`);
            }

            const detail = await detailResponse.json();

            return {
              id: detail.id,
              name: detail.name,
              image:
                detail.sprites.other["official-artwork"].front_default ||
                detail.sprites.front_default,
              types: detail.types.map((typeInfo) => typeInfo.type.name),
              stats: detail.stats.map((statInfo) => ({
                name: statInfo.stat.name,
                value: statInfo.base_stat
              }))
            };
          })
        );

        setPokemonList(pokemonDetails);
      } catch (error) {
        setErrorMessage("포켓몬을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setIsLoading(false);
      }
    }

    loadPokemon();
  }, []);

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setSelectedPokemon(null);
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const pokemonTypes = Array.from(
    new Set(pokemonList.flatMap((pokemon) => pokemon.types))
  ).sort();

  const filteredPokemon = pokemonList.filter((pokemon) => {
    const matchesType =
      selectedType === "all" || pokemon.types.includes(selectedType);
    const matchesSearch = pokemon.name
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase());

    return matchesType && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-zinc-950 px-5 py-8 text-zinc-50 sm:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <p className="mb-4 inline-flex rounded-md border border-yellow-300/30 bg-yellow-300/10 px-4 py-2 text-sm font-semibold text-yellow-200">
            PokeAPI
          </p>

          <h1 className="text-4xl font-black leading-tight text-yellow-300 sm:text-6xl">
            Pokemon Pokedex
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
            PokeAPI에서 포켓몬 20개를 가져와 이미지와 이름 카드로 보여줍니다.
          </p>
        </div>

        {isLoading && (
          <div className="rounded-md border border-zinc-800 bg-zinc-900 px-6 py-10 text-center text-zinc-300">
            포켓몬을 불러오는 중입니다...
          </div>
        )}

        {errorMessage && (
          <div className="rounded-md border border-red-400/40 bg-red-500/10 px-6 py-5 text-center font-semibold text-red-200">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && (
          <>
            <div className="mx-auto mb-5 max-w-md">
              <label
                htmlFor="pokemon-search"
                className="mb-2 block text-sm font-bold text-zinc-300"
              >
                이름으로 검색
              </label>
              <input
                id="pokemon-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="예: pikachu"
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-50 outline-none transition placeholder:text-zinc-500 focus:border-yellow-300"
              />
            </div>

            <div className="mb-6 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedType("all")}
                className={`rounded-md border px-4 py-2 text-sm font-bold capitalize transition ${
                  selectedType === "all"
                    ? "border-yellow-300 bg-yellow-300 text-zinc-950"
                    : "border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-yellow-300/70"
                }`}
              >
                all
              </button>

              {pokemonTypes.map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`rounded-md border px-4 py-2 text-sm font-bold capitalize transition ${
                    selectedType === type
                      ? "border-yellow-300 bg-yellow-300 text-zinc-950"
                      : "border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-yellow-300/70"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="mb-4 text-center text-sm font-semibold text-zinc-400">
              {filteredPokemon.length} Pokemon
            </div>

            {filteredPokemon.length === 0 ? (
              <div className="rounded-md border border-zinc-800 bg-zinc-900 px-6 py-10 text-center text-zinc-300">
                검색 결과가 없습니다.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filteredPokemon.map((pokemon) => (
                  <button
                    type="button"
                    key={pokemon.id}
                    onClick={() => setSelectedPokemon(pokemon)}
                    className="rounded-md border border-zinc-800 bg-zinc-900 p-4 text-center shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:border-yellow-300/50 focus:border-yellow-300 focus:outline-none"
                  >
                    <div className="flex aspect-square items-center justify-center rounded-md bg-zinc-800">
                      <img
                        src={pokemon.image}
                        alt={formatPokemonName(pokemon.name)}
                        className="h-28 w-28 object-contain sm:h-32 sm:w-32"
                      />
                    </div>

                    <p className="mt-4 text-xs font-bold text-zinc-500">
                      #{String(pokemon.id).padStart(3, "0")}
                    </p>

                    <h2 className="mt-1 text-lg font-black text-zinc-50">
                      {formatPokemonName(pokemon.name)}
                    </h2>

                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      {pokemon.types.map((type) => (
                        <span
                          key={type}
                          className="rounded-md bg-zinc-800 px-2 py-1 text-xs font-bold capitalize text-yellow-200"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {selectedPokemon && (
        <section
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5 py-6"
          aria-modal="true"
          role="dialog"
        >
          <div className="max-h-full w-full max-w-3xl overflow-y-auto rounded-md border border-zinc-700 bg-zinc-950 p-5 shadow-2xl shadow-black sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-zinc-500">
                  #{String(selectedPokemon.id).padStart(3, "0")}
                </p>
                <h2 className="mt-1 text-3xl font-black text-yellow-300 sm:text-4xl">
                  {formatPokemonName(selectedPokemon.name)}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPokemon(null)}
                className="rounded-md border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-bold text-zinc-200 transition hover:border-yellow-300/70"
              >
                닫기
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-[220px_1fr]">
              <div className="rounded-md bg-zinc-900 p-5">
                <div className="flex aspect-square items-center justify-center rounded-md bg-zinc-800">
                  <img
                    src={selectedPokemon.image}
                    alt={formatPokemonName(selectedPokemon.name)}
                    className="h-40 w-40 object-contain"
                  />
                </div>

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {selectedPokemon.types.map((type) => (
                    <span
                      key={type}
                      className="rounded-md bg-yellow-300 px-3 py-1 text-xs font-black capitalize text-zinc-950"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-md bg-zinc-900 p-5">
                <h3 className="mb-5 text-xl font-black text-zinc-50">
                  스탯 바 차트
                </h3>

                <div className="space-y-4">
                  {selectedPokemon.stats.map((stat) => (
                    <div key={stat.name}>
                      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                        <span className="font-bold capitalize text-zinc-300">
                          {stat.name.replace("-", " ")}
                        </span>
                        <span className="font-black text-yellow-200">
                          {stat.value}
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-md bg-zinc-800">
                        <div
                          className="h-full rounded-md bg-yellow-300"
                          style={{
                            width: `${Math.min(
                              (stat.value / MAX_STAT_VALUE) * 100,
                              100
                            )}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default App;
