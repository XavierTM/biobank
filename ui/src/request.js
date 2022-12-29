

import axios from 'axios';
import initAuth from '@xavisoft/auth/frontend';


class AxiosError extends Error {

   toString() {
      return this.message;
   }

   constructor(msg, status) {
      super(msg);
      this.status = status;
   }
}


const request = axios;

initAuth({
   axios
});



const baseUrl = process.env.REACT_APP_API_URL;

axios.interceptors.response.use(null, err => {

   if (err && err.response) {
      const msg = typeof err.response.data === 'string' ? err.response.data : err.response.statusText;;
      err = new AxiosError(msg, err.response.status);
   }

   throw err;
});

axios.interceptors.request.use(config => {
   config.url = `${baseUrl}${config.url}`; console.log(config.url)
   return config;
});

export default request;