// ===============================
// Configuración inicial
// ===============================
const input = document.getElementById("search");
const resultsDiv = document.getElementById("results");
const STRAPI_URL = "http://localhost:1337";

// ===============================
// Cargar Pokémon iniciales al abrir
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
// Buscar Pokémon dinámicamente
// ===============================
async function searchPokemon(name) {
  name = name.trim().toLowerCase();

  if (name === "") {
    await loadInitialPokemons();
    return;
  }

  resultsDiv.innerHTML = "<p>Buscando...</p>";

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1000`);
    const data = await response.json();

    const filtered = data.results.filter(p => p.name.includes(name));

    if (filtered.length === 0) {
      resultsDiv.innerHTML = "<p>No se encontraron resultados 😢</p>";
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
    console.error("❌ Error al buscar Pokémon:", error);
    resultsDiv.innerHTML = "<p>Error al buscar el Pokémon 😢</p>";
  }
}

// ===============================
// Guardar búsqueda en Strapi
// ===============================
async function saveHistorial(name) {
  try {
    const jwt = localStorage.getItem("jwt"); // Token del login
    const user = JSON.parse(localStorage.getItem("user")); // Usuario autenticado

    if (!jwt || !user) {
      console.warn("⚠️ No hay sesión activa. No se puede guardar historial.");
      return;
    }

    const bodyData = {
      data: {
        busqueda: name,
        fecha: new Date().toISOString(),
        usuario: user.id // 👈 Relación con el usuario autenticado
      }
    };

    console.log("📤 Enviando historial a Strapi:", bodyData);

    const response = await fetch(`${STRAPI_URL}/api/historials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwt}` // ✅ Se envía el JWT
      },
      body: JSON.stringify(bodyData)
    });

    const text = await response.text();
    console.log("📥 Respuesta de Strapi:", response.status, text);

    if (response.ok) {
      console.log("✅ Historial guardado correctamente!");
    } else {
      console.error("❌ Error al guardar historial:", response.status, text);
    }

  } catch (error) {
    console.error("⚠️ Error en saveHistorial:", error);
  }
}

// ===============================
// Renderizar tarjeta Pokémon
// ===============================
function renderCard(data) {
  return `
    <div class="card">
      <img src="${data.sprites.front_default}" alt="${data.name}" />
      <h3>${data.name.toUpperCase()}</h3>
      <p><b>Altura:</b> ${(data.height / 10).toFixed(1)} m</p>
      <p><b>Peso:</b> ${(data.weight / 10).toFixed(1)} kg</p>
      <p><b>Tipo:</b> ${data.types.map(t => t.type.name).join(", ")}</p>
      <p><b>Habilidad:</b> ${data.abilities.map(a => a.ability.name).join(", ")}</p>
    </div>
  `;
}

// ===============================
// Evento input (búsqueda dinámica)
// ===============================
input.addEventListener("input", (e) => {
  const value = e.target.value;
  searchPokemon(value);
});
