import Page from "./Page";
import { Button, Divider, TextField } from '@mui/material';
import { css } from '@emotion/css';
import { Link } from '@xavisoft/app-wrapper'
import { errorToast } from "../toast";
import { hideLoading, showLoading } from "../loading";
import swal from 'sweetalert';
import request from "../request";



const divSignupStyle = css({ 
   maxWidth: 400, 
   minWidth: 200,
   '& > *': {
      margin: '10px auto'
   },
   '& a': {
      display: 'inline-block',
      marginLeft: 5,
      textDecoration: 'none',
   }
});

class Signup extends Page {


   signup = async () => {

      // presence check
      const txtName = document.getElementById('txt-name');
      const txtSurname = document.getElementById('txt-surname');
      const txtEmail = document.getElementById('txt-email');
      const txtPassword = document.getElementById('txt-password');
      const txtConfirm = document.getElementById('txt-confirm');

      const name  = txtName.value;
      const surname = txtSurname.value;
      const email = txtEmail.value;
      const password = txtPassword.value;
      const confirm = txtConfirm.value;


      if (!name) {
         errorToast("Provide your first name");
         return txtName.focus();
      }

      if (!surname) {
         errorToast("Provide your last name");
         return txtSurname.focus();
      }

      if (!email) {
         errorToast("Provide your email");
         return txtEmail.focus();
      }

      if (!password) {
         errorToast("Provide a password");
         return txtPassword.focus();
      }

      if (!confirm) {
         errorToast("Confirm your password");
         return txtConfirm.focus();
      }

      if (password !== confirm) {
         errorToast("Passwords not matching");
         txtConfirm.value = '';
         txtPassword.value = '';
         return txtPassword.focus();
      }

      try {

         showLoading();

         const payload = {
            name,
            surname,
            email,
            password
         }

         await request.post('/api/users', payload);

         await swal('Account created successfully, proceed to login');

         await window.App.redirect('/');

      } catch (err) {
         swal(err.message);
      } finally {
         hideLoading();
      }
   }

   _render() {
      
      return <div className="fill-container vh-align">
         <div className={divSignupStyle}>
            <h2 className="halign">Sign Up</h2>

            <TextField
               fullWidth
               label="First Name(s)"
               id="txt-name"
               variant="standard"
               size="small"
            />

            <TextField
               fullWidth
               label="Last Name"
               id="txt-surname"
               variant="standard"
               size="small"
            />

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

            <TextField
               fullWidth
               label="Confirm password"
               id="txt-confirm"
               variant="standard"
               size="small"
               type="password"
            />
  
            <Button fullWidth variant="contained" onClick={this.signup}>
               SIGNUP
            </Button>

            <Divider />

            <div className="halign">
               Already have an account?{" "}<Link to="/">Login</Link>
            </div>
         </div>
      </div>
   }
}

export default Signup;