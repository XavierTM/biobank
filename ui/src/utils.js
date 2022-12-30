

function delay(millis) {
   return new Promise(resolve => {
      setTimeout(resolve, millis);
   })
}

function getSecretByFingerpint(description) {
   return new Promise((resolve, reject) => {
      window.Fingerprint.loadBiometricSecret({ description }, resolve, reject);
   });
}


const USER_ID_LOCAL_STORAGE_KEY = 'user_id';

function storeUserId(id) {
   window.localStorage.setItem(USER_ID_LOCAL_STORAGE_KEY, id);
}

function getUserId() {
   return window.localStorage.getItem(USER_ID_LOCAL_STORAGE_KEY);
}

function decodeJWT(token) {
   var base64Url = token.split('.')[1];
   var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
   var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
       return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
   }).join(''));

   return JSON.parse(jsonPayload);
}

export {
   decodeJWT,
   delay,
   getSecretByFingerpint,
   getUserId,
   storeUserId,
}