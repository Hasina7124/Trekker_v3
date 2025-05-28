import axios from 'axios';

export const initCsrf = () => axios.get('/sanctum/csrf-cookie');
