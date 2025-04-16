import axios from 'axios';
import { API_URL } from './api';


// Ensure cookies are sent with requests
axios.defaults.withCredentials = true;

export const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Include cookies
});
export default axios;
