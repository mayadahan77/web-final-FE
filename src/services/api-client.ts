import axios, { CanceledError } from "axios";

export { CanceledError };

const api = axios.create({
  baseURL: "http://localhost:80",
});

export default api;
