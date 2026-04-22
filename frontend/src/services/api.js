const BASE_URL = import.meta.env.VITE_API_URL;

export const api = {
    login: async (cedula) => {
        const response = await fetch(`${BASE_URL}/login/${cedula}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw { status: response.status, message: errorData.detail || 'Error en login' };
        }
        return await response.json();
    },

    scanEan: async (ean) => {
        const response = await fetch(`${BASE_URL}/scan/${ean}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw { status: response.status, message: errorData.detail || 'Error en conexión con el servidor' };
        }
        return await response.json();
    },

    saveProduct: async (payload) => {
        const response = await fetch(`${BASE_URL}/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw { status: response.status, message: errorData.detail || 'Error al guardar' };
        }
        return await response.json();
    },

    getRanking: async () => {
        const response = await fetch(`${BASE_URL}/ranking`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw { status: response.status, message: errorData.detail || 'Error al obtener ranking' };
        }
        return await response.json();
    },

    getUserStats: async (cedula) => {
        const response = await fetch(`${BASE_URL}/user-stats/${cedula}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw { status: response.status, message: errorData.detail || 'Error al obtener estadísticas' };
        }
        return await response.json();
    },

    getBrands: async () => {
        const response = await fetch(`${BASE_URL}/brands`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw { status: response.status, message: errorData.detail || 'Error al obtener marcas' };
        }
        return await response.json();
    }
};
