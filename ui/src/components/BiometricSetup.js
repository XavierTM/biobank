import { css } from "@emotion/css";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material"
import Component from "@xavisoft/react-component"
import { errorToast, successToast } from "../toast";
import swal from "sweetalert";
import { hideLoading, showLoading } from "../loading";
import request from "../request";
import { enrollFingeprint } from "../utils";

const divFormStyle = css({
   '& > *': {
      margin: '10px auto !important'
   }
});

export default class BiometricSetup extends Component {

   sendOtp = async () =>  {

      const txtEmail = document.getElementById('txt-email');
      const email = txtEmail.value;

      if (!email) {
         errorToast('Enter email');
         return txtEmail.focus();
      }

      try {

         showLoading();

         await request.get(`/api/users/otp?email=${email}`);

         swal('Check your email');

      } catch (err) {
         swal(String(err));
      } finally {
         hideLoading();
      }
   }

   setUp = async () => {

      const txtEmail = document.getElementById('txt-email');
      const txtOtp = document.getElementById('txt-otp');

      const email = txtEmail.value;
      const otp = txtOtp.value;

      if (!email) {
         errorToast('Enter email');
         return txtEmail.focus();
      }


      if (!otp) {
         errorToast('Enter OPT');
         return txtOtp.focus();
      }

      try {

         showLoading();

         const res = await request.get(`/api/users/secret?email=${email}&otp=${otp}`);

         alert(res.data.secret)
         await enrollFingeprint(res.data.secret);

         successToast('Now you can use your finger to login');
         this.props.close();

      } catch (err) {
         swal(String(err));
      } finally {
         hideLoading();
      }
   }


   render() {

      return <Dialog open={this.props.open}>

         <DialogTitle>Setup biometrics</DialogTitle>

         <DialogContent>
            <div className={divFormStyle}>

               <div
                  style={{
                     display: 'grid',
                     gridTemplateColumns: 'auto 70px',
                     columnGap: 20,
                  }}
               >
                  <TextField
                     fullWidth
                     id="txt-email"
                     label="Email"
                     variant="standard"
                     size="small"
                  />

                  <Button onClick={this.sendOtp}>
                     SEND OTP
                  </Button>
               </div>

               <TextField
                  fullWidth
                  id="txt-otp"
                  label="OTP"
                  variant="standard"
                  size="small"
                  type="number"
               />

            </div>
         </DialogContent>

         <DialogActions>
            <Button variant="contained" onClick={this.setUp}>
               SUBMIT
            </Button>

            <Button onClick={this.props.close}>
               CANCEL
            </Button>

         </DialogActions>
      </Dialog>

   }
}