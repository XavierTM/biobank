
import EventEmitter from 'events';
import { delay, getUserId } from './utils';

let url

if (process.env.NODE_ENV !== 'production')
   url = 'http://localhost:8080/sse'; // in development
else if (window.location.href.indexOf('localhost/index.html') > 1)
   url = `${process.env.REACT_APP_API_URL}/sse`; // cordova
else
   url = '/sse' // on the web app



class SSEConnection extends EventEmitter {


   static EVENT_NAMES = [
      'payment-rejection',
      'payment-approval',
      'payment-request'
   ]

   connected = false;

   disconnect() {
      try {
         this.eventSource.close();
      } catch {};
      this.eventSource = null;
      this.connected = false;
   }

   connect() {

      const userId = getUserId();

      if (!userId) {
         setTimeout(() => {
            this.connect();
         }, 10000);
         return;
      }

      this.disconnect();

      const eventSource = new window.EventSource(`${this._url}/${userId}`);

      SSEConnection.EVENT_NAMES.forEach(eventName => {
         eventSource.addEventListener(eventName, event => {
            const data = JSON.parse(event.data)
            console.log(`${eventName}:`, data);
            this.emit(eventName, data);
         });         
      });

      eventSource.addEventListener('error', async (ev) => {

         console.log(ev);

         if (this.connected)
            return; // because it will auto reconnect anyway

         await delay(5000);
         this.connect();

         console.error('========================');
         console.error('SSE DISCONNECTED');
         console.error('========================');
      });

      eventSource.addEventListener('open', () => {

         this.connected = true;

         console.log('========================');
         console.log("SSE CONNECTED"); 
         console.log('========================');

      });

      this.eventSource = eventSource;

   }

   constructor(url) {
      super();
      this._url = url;
   }
   
}



const sse = new SSEConnection(url);
sse.connect();



export default sse;