import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_API_BASEL;

const api = axios.create({
  baseURL: baseUrl,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("kaa_token");
    if (!(token === null)) {
      console.log("token is not null");
      console.log("Authenticated");
      config.headers["Authorization"] = "Bearer " + token;
      console.log(config);
    }
    // setTimeout(() => {
    //   sessionStorage.clear();
    // }, 30 * 60000);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (config) => config,
  (error) => {
    console.error("Error in request interceptor:", error);
    console.log(error.response);

    if (error?.response?.status == 401) {
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      } 
    }

    return Promise.reject(error);
  }
);

export default api;
