document.addEventListener("DOMContentLoaded", () => {
  // If already logged in, skip straight to the dashboard.
  if (sessionStorage.getItem("adminToken")) {
    window.location.href = "admin.html";
    return;
  }

  const form = document.getElementById("adminLoginForm");
  const errorEl = document.getElementById("loginError");
  const submitBtn = document.getElementById("loginSubmitBtn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = form.username.value.trim();
    const password = form.password.value;

    errorEl.textContent = "";
    errorEl.classList.remove("visible");

    if (!username || !password) {
      errorEl.textContent = "Please enter your username and password.";
      errorEl.classList.add("visible");
      return;
    }

    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Login failed.");
      }

      sessionStorage.setItem("adminToken", data.token);
      window.location.href = "admin.html";
    } catch (error) {
      errorEl.textContent = error.message;
      errorEl.classList.add("visible");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
});
