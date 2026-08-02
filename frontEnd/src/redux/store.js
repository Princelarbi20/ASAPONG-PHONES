import { createSlice, configureStore } from '@reduxjs/toolkit';

const loadPersistedAuth = () => {
    if (typeof window === 'undefined') return { user: null, token: null, role: null };
    try {
        const saved = window.localStorage.getItem('authState');
        if (!saved) return { user: null, token: null, role: null };
        const parsed = JSON.parse(saved);
        return {
            user: parsed?.user || null,
            token: parsed?.token || null,
            role: parsed?.role || null,
        };
    } catch {
        return { user: null, token: null, role: null };
    }
};

const initialState = loadPersistedAuth();

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state, action) {
            state.user = action.payload?.user || null;
            state.token = null;
            state.role = action.payload?.role || null;
            if (typeof window !== 'undefined') {
                window.localStorage.setItem('authState', JSON.stringify({ user: state.user, token: state.token, role: state.role }));
            }
        },
        logout(state) {
            state.user = null;
            state.token = null;
            state.role = null;
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem('authState');
            }
        },
        setCart(state, action) {
            if (!state.user) return;
            state.user.cart = Array.isArray(action.payload) ? action.payload : [];
        }
    }
});

export const authAction = authSlice.actions;

export const store = configureStore({
    reducer: {
        auth: (state, action) => {
            const newState = authSlice.reducer(state, action);
            
            return { ...newState, isLogin: !!newState.user };
        }
    }
});
