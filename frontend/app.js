// ===============================
// Configuración inicial
// ===============================
const input = document.getElementById("search");
const resultsDiv = document.getElementById("results");
const STRAPI_URL = "http://localhost:1337";

// ===============================
// Load starter Pokémon
// ===============================
window.addEventListener("load", async () => {
  await loadInitialPokemons();
});

async function loadInitialPokemons() {
  try {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=20");
    const data = await response.json();

    resultsDiv.innerHTML = "";
    for (const pokemon of data.results) {
      const pokeRes = await fetch(pokemon.url);
      const pokeData = await pokeRes.json();
      resultsDiv.innerHTML += renderCard(pokeData);
    }
  } catch (err) {
    console.error("❌ Error al cargar los Pokémon iniciales:", err);
    resultsDiv.innerHTML = "<p>Error al cargar los Pokémon 😢</p>";
  }
}

// ===============================
// Search Pokémon dynamically
// ===============================
async function searchPokemon(name) {
  name = name.trim().toLowerCase();

  if (name === "") {
    await loadInitialPokemons();
    return;
  }

  resultsDiv.innerHTML = "<p>Searching...</p>";

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1000`);
    const data = await response.json();

    const filtered = data.results.filter(p => p.name.includes(name));

    if (filtered.length === 0) {
      resultsDiv.innerHTML = "<p>No results found. 😢</p>";
      return;
    }

    resultsDiv.innerHTML = "";

    for (const pokemon of filtered.slice(0, 12)) {
      const pokeRes = await fetch(pokemon.url);
      const pokeData = await pokeRes.json();
      resultsDiv.innerHTML += renderCard(pokeData);
    }

    // Guardar búsqueda en Strapi
    await saveHistorial(name);

  } catch (error) {
    console.error("❌ Error searching for Pokemon", error);
    resultsDiv.innerHTML = "<p>Error searching for Pokemon 😢</p>";
  }
}

// ===============================
// Save search in Strapi
// ===============================
async function saveHistorial(name) {
  try {
    const jwt = localStorage.getItem("jwt");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!jwt || !user) {
      console.warn("⚠️ No active session. Unable to save history.");
      return;
    }

    const bodyData = {
      data: {
        Busqueda: name,
        Fecha: new Date().toISOString(),
        Usuario: user.username || user.email
      }
    };

    const response = await fetch(`${STRAPI_URL}/api/historials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwt}`
      },
      body: JSON.stringify(bodyData)
    });

    const result = await response.json();
    console.log("✅ History saved:", result);
  } catch (error) {
    console.error("⚠️ Error in saveHistorial:", error);
  }
}

// ===============================
// Render Pokemon card
// ===============================
function renderCard(data) {
  return `
    <div class="card">
      <img src="${data.sprites.front_default}" alt="${data.name}" />
      <h3>${data.name.toUpperCase()}</h3>
      <p><b>Height:</b> ${(data.height / 10).toFixed(1)} m</p>
      <p><b>Weight:</b> ${(data.weight / 10).toFixed(1)} kg</p>
      <p><b>Type:</b> ${data.types.map(t => t.type.name).join(", ")}</p>
      <p><b>Ability:</b> ${data.abilities.map(a => a.ability.name).join(", ")}</p>
    </div>
  `;
}

// ===============================
// Search event
// ===============================
input.addEventListener("input", (e) => {
  const value = e.target.value;
  searchPokemon(value);
});
