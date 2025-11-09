const STRAPI_URL = "http://54.224.55.129:1337";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");

  msg.textContent = "Logging in…";

  try {
    const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      // Store the token and user
      localStorage.setItem("jwt", data.jwt);
      localStorage.setItem("user", JSON.stringify(data.user));
      msg.textContent = "✅ Session started successfully";

      // Redirecting to the Pokédex
      window.location.href = "app.html";
    } else {
      msg.textContent = "❌ Error: " + (data.error?.message || "Invalid credentials");
    }
  } catch (err) {
    msg.textContent = "⚠️ Connection error with the server.";
    console.error(err);
  }
});
