import Page from "./Page";
import { Button, Divider, TextField } from '@mui/material';
import { css } from '@emotion/css';
import { Link } from '@xavisoft/app-wrapper'
import { errorToast } from "../toast";
import { hideLoading, showLoading } from "../loading";
import swal from 'sweetalert';
import request from "../request";
import { v4 as uuid } from 'uuid'
import { enrollFingeprint } from "../utils";



const divSignupStyle = css({ 
   maxWidth: 400, 
   minWidth: 200,
   '& > *': {
      margin: '10px auto !important'
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

      const name  = txtName.value;
      const surname = txtSurname.value;
      const email = txtEmail.value;

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

      try {

         showLoading();

         const secret = uuid();

         await enrollFingeprint(secret);

         const payload = {
            name,
            surname,
            email,
            secret,
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