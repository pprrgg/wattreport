// /data/constants.js

const API_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "https://doctec.duckdns.org/fast";

export const primaryColor = "darkblue";

export const PDF_API_URL = `${API_URL}/contacto`;
