import api from './api';

export const auth = {
    // Register a new clinic
    registerClinic: async (data) => {
        const response = await api.post('/auth/register-clinic', data);
        return response.data;
    },

    // Login
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    // Logout
    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    // Get current user
    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
};

export const clinics = {
    // Get all clinics (public)
    getAll: async (params) => {
        const response = await api.get('/clinics', { params });
        return response.data;
    },

    // Get clinic by ID (public)
    getById: async (id) => {
        const response = await api.get(`/clinics/${id}`);
        return response.data;
    },

    // Update clinic
    update: async (id, data) => {
        const response = await api.put(`/clinics/${id}`, data);
        return response.data;
    },
};

export const users = {
    // Get all users in clinic
    getAll: async () => {
        const response = await api.get('/users');
        return response.data;
    },

    // Create user
    create: async (data) => {
        const response = await api.post('/users', data);
        return response.data;
    },

    // Update user
    update: async (id, data) => {
        const response = await api.put(`/users/${id}`, data);
        return response.data;
    },

    // Delete user
    delete: async (id) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },
};

export const patients = {
    // Get all patients
    getAll: async () => {
        const response = await api.get('/patients');
        return response.data;
    },

    // Get patient by ID
    getById: async (id) => {
        const response = await api.get(`/patients/${id}`);
        return response.data;
    },

    // Create patient
    create: async (data) => {
        const response = await api.post('/patients', data);
        return response.data;
    },

    // Update patient
    update: async (id, data) => {
        const response = await api.put(`/patients/${id}`, data);
        return response.data;
    },

    // Delete patient
    delete: async (id) => {
        const response = await api.delete(`/patients/${id}`);
        return response.data;
    },
};

export const appointments = {
    // Get all appointments
    getAll: async (params) => {
        const response = await api.get('/appointments', { params });
        return response.data;
    },

    // Get appointment by ID
    getById: async (id) => {
        const response = await api.get(`/appointments/${id}`);
        return response.data;
    },

    // Create appointment
    create: async (data) => {
        const response = await api.post('/appointments', data);
        return response.data;
    },

    // Update appointment
    update: async (id, data) => {
        const response = await api.put(`/appointments/${id}`, data);
        return response.data;
    },

    // Cancel appointment
    cancel: async (id) => {
        const response = await api.delete(`/appointments/${id}`);
        return response.data;
    },
};
