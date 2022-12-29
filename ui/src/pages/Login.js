import Page from "./Page";
import { Button, Divider, TextField } from '@mui/material';
import { css } from '@emotion/css';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { Link } from '@xavisoft/app-wrapper';
import { errorToast } from '../toast';
import { hideLoading, showLoading } from '../loading';
import request from '../request';
import swal from 'sweetalert';
import { getSecretByFingerpint } from "../utils";




const divLoginStyle = css({ 
   maxWidth: 400, 
   minWidth: 200,
   margin: 10,
   '& > *': {
      margin: '10px auto'
   },
   '& a': {
      display: 'inline-block',
      marginLeft: 5,
      textDecoration: 'none',
   }
});

class Login extends Page {


   authenticate = async (credentials) => {

      try {

         showLoading();
         await request.post('/api/login', credentials);
         window.App.redirect('/dashboard');

      } catch (err) {
         swal(String(err));
      } finally {
         hideLoading()
      }
   } 


   fingerprint = async () => {

      if (!window.Fingerprint)
         return errorToast('Fingeprint print login not supported on this platform');
         
      try {
         const secret = await getSecretByFingerpint('Login using yiur fingeprint');
         this.authenticate({ secret });
      } catch (err) {
         swal(String(err));
      }
   }


   password = () => {

      // check
      const txtEmail = document.getElementById('txt-email');
      const txtPassword = document.getElementById('txt-password');

      const email = txtEmail.value;
      const password = txtPassword.value;

      if (!email) {
         errorToast('Email is required');
         return txtEmail.focus();
      }

      if (!password) {
         errorToast('Password is required');
         return txtPassword.focus();
      }

      this.authenticate({ email, password })

      
   }

   _render() {
      
      return <div className="fill-container vh-align">
         <div className={divLoginStyle}>
            <h2 className="halign">Login</h2>

            <TextField
               fullWidth
               label="Email"
               id="txt-email"
               variant="standard"
               size="small"
            />

            <TextField
               fullWidth
               label="Password"
               id="txt-password"
               variant="standard"
               size="small"
               type="password"
            />

            <div style={{
               display: 'grid',
               gridTemplateColumns: '1fr 1fr',
               columnGap: 20
            }}>
               <div>
                  <Button fullWidth variant="contained" onClick={this.password}>
                     LOGIN
                  </Button>
               </div>

               <div>
                  <Button fullWidth variant="outline" onClick={this.fingerprint} color="primary">
                     <FingerprintIcon />
                     FINGERPRINT
                  </Button>
               </div>

            </div>

            <Divider />

            <div className="halign">
               Don't have an account?{" "}<Link to="/signup">Sign up</Link>
            </div>
         </div>
      </div>
   }
}

export default Login;