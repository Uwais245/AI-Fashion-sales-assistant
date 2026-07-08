export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Flip VITE_USE_MOCK_DATA=false in .env.local once the backend endpoints in
// API_CONTRACT.md are live. Each services/api/*.js file has an `if (USE_MOCK)`
// branch — real axios calls go in the else branch.
export const USE_MOCK = (import.meta.env.VITE_USE_MOCK_DATA ?? 'true') === 'true';
