// Central place for the backend URL. Update PRODUCTION_API_URL once your
// backend is deployed (e.g. to Render or Railway), then this one line is all
// that needs to change — no more hunting through script.js/chatbot.js/admin.js.

const PRODUCTION_API_URL = "https://REPLACE-WITH-YOUR-BACKEND-URL.onrender.com";

const API_BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5001"
    : PRODUCTION_API_URL;
