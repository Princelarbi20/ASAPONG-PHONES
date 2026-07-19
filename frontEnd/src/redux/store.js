import { createSlice, configureStore } from '@reduxjs/toolkit';

const AUTH_STORAGE_KEY = 'asapongAuth';

const initialAuth = {
    isLogin: false,
    user: null,
    token: null,
    role: null,
};

const loadStoredAuth = () => {
    if (typeof window === 'undefined') return initialAuth;

    try {
        // Authentication is held in HttpOnly cookies. Persist only display data,
        // never a bearer token that an XSS payload could steal.
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return {
                isLogin: Boolean(parsed?.user),
                user: parsed?.user || null,
                token: null,
                role: parsed?.role || null,
            };
        }
        localStorage.removeItem('token');
    } catch (err) {
        console.warn('Could not restore auth state from localStorage.', err);
    }

    return initialAuth;
};

const saveAuthState = (state) => {
    if (typeof window === 'undefined') return;

    localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
            user: state.user,
            role: state.role,
        })
    );
};

const clearAuthState = () => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('token');
};

export const authSlice = createSlice({
    name: 'auth',
    initialState: loadStoredAuth(),
    reducers: {
        login(state, action) {
            state.isLogin = true;
            state.user = action.payload?.user || null;
            state.token = null;
            state.role = action.payload?.role || null;
            saveAuthState(state);
        },
        logout(state) {
            state.isLogin = false;
            state.user = null;
            state.token = null;
            state.role = null;
            clearAuthState();
        },
        setCart(state, action) {
            if (!state.user) return;
            state.user.cart = Array.isArray(action.payload) ? action.payload : [];
            saveAuthState(state);
        }
    }
});

export const authAction = authSlice.actions;

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer // Keying it under 'auth' cleanly
    }
});
