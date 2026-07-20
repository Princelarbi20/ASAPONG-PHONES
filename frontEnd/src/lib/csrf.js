import axios from 'axios';

let csrfToken = null;

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
        const response = await axios.get('/api/v1/csrf-token', { withCredentials: true });
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
