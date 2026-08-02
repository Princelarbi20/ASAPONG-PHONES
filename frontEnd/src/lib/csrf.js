import axios from 'axios';

let csrfToken = null;
const apiBaseUrl = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/v1`
    : '/api/v1';

export const configureApiSecurity = () => {
    axios.defaults.withCredentials = true;
    axios.interceptors.request.use(async (config) => {
        const method = (config.method || 'get').toLowerCase();
        if (!['get', 'head', 'options'].includes(method)) {
            const token = await getCsrfToken();
            config.headers = config.headers || {};
            if (token) config.headers['X-CSRF-Token'] = token;
        }

        const authorization = config.headers?.Authorization || config.headers?.authorization;
        if (authorization === 'Bearer null' || authorization === 'Bearer undefined') {
            delete config.headers.Authorization;
            delete config.headers.authorization;
        }
        return config;
    });
};

export const getCsrfToken = async () => {
    if (csrfToken) return csrfToken;

    try {
        const response = await axios.get(`${apiBaseUrl}/csrf-token`, { withCredentials: true });
        csrfToken = response.data?.csrfToken || null;
        return csrfToken;
    } catch {
        return null;
    }
};

export const withCsrf = async (config = {}) => {
    const token = await getCsrfToken();
    return {
        ...config,
        headers: {
            ...(config.headers || {}),
            ...(token ? { 'X-CSRF-Token': token } : {}),
        },
    };
};
