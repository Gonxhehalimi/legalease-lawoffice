document.addEventListener("DOMContentLoaded", () => {
  // API_BASE_URL comes from js/config.js, loaded before this file.

  // ===== Auth guard =====
  // If there's no session token, don't even try to load the dashboard —
  // send the user to the login page immediately.
  const token = sessionStorage.getItem("adminToken");
  if (!token) {
    window.location.href = "admin-login.html";
    return;
  }

  const consultationsBody = document.getElementById("consultationsTableBody");
  const contactBody = document.getElementById("contactTableBody");
  const statusBox = document.getElementById("adminStatus");
  const reloadConsultationsBtn = document.getElementById("reloadConsultationsBtn");
  const reloadContactBtn = document.getElementById("reloadContactBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!consultationsBody || !contactBody) return;

  function showStatus(message) {
    if (!statusBox) return;
    statusBox.textContent = message;
    statusBox.classList.add("visible");
  }

  function clearStatus() {
    if (!statusBox) return;
    statusBox.textContent = "";
    statusBox.classList.remove("visible");
  }

  function formatDate(dateValue) {
    if (!dateValue) return "-";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function logout() {
    sessionStorage.removeItem("adminToken");
    window.location.href = "admin-login.html";
  }

  async function request(path, options = {}) {
    let response;
    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${sessionStorage.getItem("adminToken")}`
        }
      });
    } catch (error) {
      throw new Error("Backend is offline. Please start the server and reload this page.");
    }

    if (response.status === 401 || response.status === 403) {
      // Session expired or invalid — send back to login.
      logout();
      throw new Error("Session expired. Please log in again.");
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Request failed.");
    }
    return data;
  }

  async function loadConsultations() {
    try {
      clearStatus();
      const rows = await request("/api/consultations");

      if (!rows.length) {
        consultationsBody.innerHTML = "<tr><td colspan='9'>No consultation requests yet.</td></tr>";
        return;
      }

      consultationsBody.innerHTML = rows
        .map((item) => {
          const safeMessage = item.message ? escapeHtml(item.message) : "-";
          return `
            <tr>
              <td>${escapeHtml(item.full_name)}</td>
              <td>${escapeHtml(item.email)}</td>
              <td>${escapeHtml(item.phone)}</td>
              <td>${escapeHtml(item.legal_service)}</td>
              <td>${formatDate(item.preferred_date)}</td>
              <td>${escapeHtml(item.preferred_time)}</td>
              <td>${safeMessage}</td>
              <td>
                <select class="admin-status-select" data-id="${item.id}">
                  <option value="Pending" ${item.status === "Pending" ? "selected" : ""}>Pending</option>
                  <option value="Approved" ${item.status === "Approved" ? "selected" : ""}>Approved</option>
                  <option value="Rejected" ${item.status === "Rejected" ? "selected" : ""}>Rejected</option>
                </select>
              </td>
              <td>
                <button class="admin-action-btn admin-delete-btn" data-type="consultation" data-id="${item.id}">Delete</button>
              </td>
            </tr>
          `;
        })
        .join("");
    } catch (error) {
      consultationsBody.innerHTML = "<tr><td colspan='9'>Unable to load consultation requests.</td></tr>";
      showStatus(error.message);
    }
  }

  async function loadContactMessages() {
    try {
      clearStatus();
      const rows = await request("/api/contact");

      if (!rows.length) {
        contactBody.innerHTML = "<tr><td colspan='7'>No contact messages yet.</td></tr>";
        return;
      }

      contactBody.innerHTML = rows
        .map((item) => `
            <tr>
              <td>${escapeHtml(item.name)}</td>
              <td>${escapeHtml(item.email)}</td>
              <td>${escapeHtml(item.phone || "-")}</td>
              <td>${escapeHtml(item.subject)}</td>
              <td>${escapeHtml(item.message)}</td>
              <td>${formatDate(item.created_at)}</td>
              <td>
                <button class="admin-action-btn admin-delete-btn" data-type="contact" data-id="${item.id}">Delete</button>
              </td>
            </tr>
        `)
        .join("");
    } catch (error) {
      contactBody.innerHTML = "<tr><td colspan='7'>Unable to load contact messages.</td></tr>";
      showStatus(error.message);
    }
  }

  async function onStatusChange(event) {
    const target = event.target;
    if (!target.classList.contains("admin-status-select")) return;

    const id = target.getAttribute("data-id");
    const status = target.value;

    try {
      await request(`/api/consultations/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      clearStatus();
    } catch (error) {
      showStatus(error.message);
    }
  }

  async function onDeleteClick(event) {
    const target = event.target;
    if (!target.classList.contains("admin-delete-btn")) return;

    const id = target.getAttribute("data-id");
    const type = target.getAttribute("data-type");
    if (!id || !type) return;

    const confirmed = window.confirm("Are you sure you want to delete this item?");
    if (!confirmed) return;

    try {
      if (type === "consultation") {
        await request(`/api/consultations/${id}`, { method: "DELETE" });
        await loadConsultations();
      } else {
        await request(`/api/contact/${id}`, { method: "DELETE" });
        await loadContactMessages();
      }
      clearStatus();
    } catch (error) {
      showStatus(error.message);
    }
  }

  consultationsBody.addEventListener("change", onStatusChange);
  consultationsBody.addEventListener("click", onDeleteClick);
  contactBody.addEventListener("click", onDeleteClick);

  reloadConsultationsBtn?.addEventListener("click", loadConsultations);
  reloadContactBtn?.addEventListener("click", loadContactMessages);
  logoutBtn?.addEventListener("click", logout);

  loadConsultations();
  loadContactMessages();
});
