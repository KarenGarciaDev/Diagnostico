const STRAPI_URL = "http://localhost:1337";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");

  msg.textContent = "Iniciando sesión...";

  try {
    const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      // Guarda el token y el usuario
      localStorage.setItem("jwt", data.jwt);
      localStorage.setItem("user", JSON.stringify(data.user));
      msg.textContent = "✅ Sesión iniciada correctamente";

      // Redirige a la Pokédex
      window.location.href = "pokedex.html";
    } else {
      msg.textContent = "❌ Error: " + (data.error?.message || "Credenciales incorrectas");
    }
  } catch (err) {
    msg.textContent = "⚠️ Error de conexión con el servidor.";
    console.error(err);
  }
});
