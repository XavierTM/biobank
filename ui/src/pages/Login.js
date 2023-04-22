import Page from "./Page";
import { Button, Divider, } from '@mui/material';
import { css } from '@emotion/css';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { Link } from '@xavisoft/app-wrapper';
import { hideLoading, showLoading } from '../loading';
import request from '../request';
import swal from 'sweetalert';
import { getSecretByFingerpint, storeUserId } from "../utils";
import sse from "../sse";




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
      color: '#00e'
   },
   border: '1px solid grey',
   padding: 20,
   borderRadius: 20,
});

class Login extends Page {


   authenticate = async (credentials) => {

      try {

         showLoading();
         const res = await request.post('/api/login', credentials);
         window.App.redirect('/dashboard');

         // connect sse
         const userId = res.data.id;
         storeUserId(userId);
         sse.connect();

      } catch (err) {
         swal(String(err));
      } finally {
         hideLoading()
      }
   } 


   fingerprint = async () => {
         
      try {
         const secret = await getSecretByFingerpint('Login using your fingeprint');
         this.authenticate({ secret });
      } catch (err) {
         swal(String(err));
      }
   }

   _render() {
      
      return <div className="fill-container vh-align">
         <div className={divLoginStyle}>

            <div>
               <Button 
                  fullWidth 
                  variant="contained" 
                  onClick={this.fingerprint} 
                  color="primary"
                  startIcon={<FingerprintIcon />}
               >
                  LOGIN
               </Button>
            </div>

            <Divider />

            <div className="halign">
               Don't have an account?{" "}<Link to="/signup">Sign up</Link>
            </div>

            <div className="halign">
               <Link to="">Setup biometrics</Link>
            </div>
         </div>
      </div>
   }
}

export default Login;