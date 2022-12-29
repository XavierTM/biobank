
import EventEmitter from 'events';
import { delay } from './utils';

const { LOCAL_STORAGE_KEY='openstack-xavisoft-auth'  } = require('@xavisoft/auth/constants')

const url = `${process.env.REACT_APP_API_URL}/sse`;


class SSEConnection extends EventEmitter {


   static EVENT_NAMES = [
      'payment-rejection',
      'payment-approval',
      'payment-request'
   ]

   _readAuthTokensFromLocalStorage() {

      try {
         const json = window.localStorage.getItem(LOCAL_STORAGE_KEY);
         return JSON.parse(json) || {};
      } catch {
         return {};
      }
   }

   connect() {

      const { access_token } = this._readAuthTokensFromLocalStorage();

      const eventSource = new window.EventSource(`${this._url}/${access_token}`);

      SSEConnection.EVENT_NAMES.forEach(eventName => {
         eventSource.addEventListener(eventName, event => {
            const data = JSON.parse(event.data)
            console.log(`${eventName}:`, data);
            this.emit(eventName, data);
         });         
      });

      eventSource.addEventListener('error', async (ev) => {
         await delay(3000);
         this.connect();
      });

   }

   constructor(url) {
      super();
      this._url = url;
   }
   
}



const sse = new SSEConnection(url);
sse.connect();



export default sse;