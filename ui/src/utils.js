

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

export {
   delay,
   getSecretByFingerpint,
}