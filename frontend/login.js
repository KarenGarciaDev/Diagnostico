document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("http://localhost:1337/api/auth/local", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: email, // Strapi usa "identifier" para email o username
        password
      })
    });

    const data = await res.json();

    if (res.ok) {
      // ✅ Guardar token y usuario en localStorage
      localStorage.setItem("jwt", data.jwt);
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("🔑 Login exitoso:", data);

      // Mostrar mensaje opcional
      document.getElementById("msg").style.color = "green";
      document.getElementById("msg").textContent = `Bienvenido ${data.user.username || data.user.email}`;

      // Redirigir a tu aplicación principal (app.html)
      setTimeout(() => {
        location.href = "app.html";
      }, 1000);
    } else {
      console.error("❌ Error de login:", data);
      document.getElementById("msg").style.color = "red";
      document.getElementById("msg").textContent =
        data.error?.message || "Usuario o contraseña incorrectos";
    }
  } catch (err) {
    console.error("⚠️ Error al conectar con Strapi:", err);
    document.getElementById("msg").style.color = "red";
    document.getElementById("msg").textContent = "Error al conectar con el servidor.";
  }
});
