const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/api.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add axios import and setup
const axiosSetup = `import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
        ? \`\${import.meta.env.VITE_API_BASE_URL}/api\` 
        : (import.meta.env.VITE_API_URL || 'http://localhost:3001/api')
});

API.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token && config.headers) {
        config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
});
`;

if (!content.includes('import axios')) {
    content = content.replace(
        'const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";',
        axiosSetup
    );
}

// 2. Replace simple gets: 
// const res = await fetch(`${API_BASE}/endpoint`);
// if (!res.ok) throw new Error("...");
// return res.json();
content = content.replace(/const res = await fetch\(`\$\{API_BASE\}\/([^`]+)`\);\s*if \(!res\.ok\) throw new Error\([^)]+\);\s*return res\.json\(\);/g, 
"const res = await API.get(`/$1`);\n    return res.data;");

// 3. Replace posts with token (the token is now in interceptor)
// const res = await fetch(`${API_BASE}/...`, { method: "POST", headers: getAuthHeaders() ... })
// This is harder via simple regex, but let's replace `fetch(` with `API.` for standard ones.

fs.writeFileSync(filePath, content);
console.log('Done transforming some fetches to axios');
