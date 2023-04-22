


function presenceChecker(keys=[]) {
   keys.forEach(key => {

      if (!process.env[key]) {
         throw new Error(`Environment variable '${key}' is essential`);
      }
   });
}

const BASE_KEYS = [
   'JWT_SECRET',
   'PORT',
   'NODE_ENV',
   'IMAP_USERNAME',
   'IMAP_PASSWORD',
];


presenceChecker(BASE_KEYS);

const CONDITIONAL_KEYS = [];

presenceChecker(CONDITIONAL_KEYS);