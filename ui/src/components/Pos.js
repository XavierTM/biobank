import { css } from "@emotion/css";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import Component from "@xavisoft/react-component";
import swal from "sweetalert";
import { hideLoading, showLoading } from "../loading";
import request from "../request";
import sse from "../sse";
import { errorToast } from "../toast";

const divPosStyle = css({
   width: 250,
   borderRadius: 10,
   border: '1px solid #ddd',
   padding: 30,

   '& > *': {
      margin: '10px auto !important'
   }
})


class Pos extends Component {

   waitForPayment = (id) => {

      console.log({ id });
      return new Promise((resolve, reject) => {
         sse.once(`payment-rejection-${id}`, data => {
            const { reason } = data;
            reject(new Error(`Payment rejected (${reason})`));
         });

         sse.once(`payment-approval-${id}`, resolve);
      });
   }

   requestPayment = async () => {

      const txtAccountNo = document.getElementById('txt-account-no');
      const txtAmount = document.getElementById('txt-amount');

      const account_no = txtAccountNo.value;
      const amount = txtAmount.value;

      if (!account_no) {
         errorToast('Account number is required');
         return txtAccountNo.focus()
      }
      
      if (!amount) {
         errorToast('Amount is required');
         return txtAmount.focus()
      }

      const merchant = this.props.data.id;

      try {

         showLoading();

         const res = await request.post('/api/transactions', {
            merchant,
            from: account_no,
            amount
         });

         await this.waitForPayment(res.data.id);

         swal('Payment approved');
         txtAccountNo.value = '';
         txtAmount.value = '';

      } catch (err) {
         swal(String(err));
      } finally {
         hideLoading();
      }


   }

   render() {

      const { name } = this.props.data || {}

      return <Dialog
         open={this.props.open}
         fullScreen
         fullWidth
      >

         <DialogTitle>BIOMETRIC POS</DialogTitle>

         <DialogContent>
            <div className="vh-align fill-container">
               <div 
                  className={divPosStyle}
               >
                  <h1>{name}</h1>

                  <TextField
                     fullWidth
                     id="txt-account-no"
                     size="small"
                     variant="standard"
                     label="Account number"
                     type="number"
                  />

                  <TextField
                     fullWidth
                     id="txt-amount"
                     size="small"
                     variant="standard"
                     label="Amount"
                     type="number"
                  />

                  <Button
                     fullWidth
                     variant="contained"
                     size="large"
                     onClick={this.requestPayment}
                  >
                     REQUEST PAYMENT
                  </Button>
               </div>
            </div>
         </DialogContent>

         <DialogActions>
            <Button onClick={this.props.close}>
               BACK
            </Button>
         </DialogActions>
      </Dialog>
   }
}

export default Pos;