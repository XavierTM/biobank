import Fingerprint from "@mui/icons-material/Fingerprint";
import Close from "@mui/icons-material/Close";
import { Button, Dialog, DialogContent, DialogTitle, TextField } from "@mui/material";
import Component from "@xavisoft/react-component";
import { errorToast } from "../toast";
import swal from "sweetalert";
import request from "../request";
import { hideLoading, showLoading } from "../loading";
import { css } from "@emotion/css";
import { getSecretByFingerpint } from "../utils";


const divFormStyle = css({
   '& > *': {
      margin: '5px auto !important'
   }
})


class PaymentApproval extends Component {


   fingerprint = async () => {
      
      try {
         const secret = await getSecretByFingerpint('Scan fingerprint to approve the payment');
         this.approvePayment({ secret });
      } catch (err) {
         swal(String(err));
      }
   }

   approvePayment = async (data) => {

      try {
         showLoading();
         await request.post(`/api/transactions/${this.props.data.transactionId}/approval`, data);
         this.props.close(true);
      } catch (err) {
         swal(String(err));
      } finally {
         hideLoading();
      }
   }

   password = () => {

      const txtPassword = document.getElementById('txt-password');
      const password = txtPassword.value;

      if (!password) {
         errorToast('Password is required');
         return txtPassword.focus();
      }

      this.approvePayment({ password });

   }

   render() {


      const data= this.props.data || {};

      let approvalJSX;

      if (this.props.fingerprintAvailable) {
         approvalJSX = <Button variant="contained" fullWidth onClick={this.fingerprint} size="large">
            <Fingerprint style={{ marginRight: 5 }} />
            APPROVE
         </Button>
      } else {
         approvalJSX = <>

            <TextField
               fullWidth
               label="Password"
               variant="standard"
               size="small"
               id="txt-password"
               type="password"
            />

            <Button variant="contained" fullWidth onClick={this.password} size="large">
               APPROVE
            </Button>
         </>
      }

      return <Dialog open={this.props.open}>

         <DialogTitle>APPROVE PAYMENT</DialogTitle>

         <DialogContent>

            <div className="center-align" style={{ width: 200 }}>
               <h3>{data.merchant}</h3>
               <h1 className="grey-text">{data.amount}</h1>

               <div className={divFormStyle}>
                  
                  {approvalJSX}

                  <Button fullWidth onClick={this.props.close} size="large">
                     <Close  style={{ marginRight: 5 }} />
                     IGNORE
                  </Button>
               </div>
            </div>
         </DialogContent>
      </Dialog>
   }
}


export default PaymentApproval;