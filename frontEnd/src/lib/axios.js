import axios from 'axios';

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
};

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true,
});

const fetchCsrfToken = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/v1/csrf-token', {
      withCredentials: true,
    });
    return response.data?.csrfToken || null;
  } catch (error) {
    return null;
  }
};

axiosInstance.interceptors.request.use(
  async (config) => {
    const method = config.method?.toUpperCase() || 'GET';
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      let csrfToken = getCookie('csrfToken');
      if (!csrfToken) {
        csrfToken = await fetchCsrfToken();
      }
      if (csrfToken) {
        config.headers = {
          ...(config.headers || {}),
          'X-CSRF-Token': csrfToken,
        };
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;