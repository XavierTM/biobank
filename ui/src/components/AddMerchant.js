import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import Component from "@xavisoft/react-component";
import swal from "sweetalert";
import { hideLoading, showLoading } from "../loading";
import request from "../request";
import { errorToast } from "../toast";


class AddMerchant extends Component {

   submit = async ()  => {

      const txtName = document.getElementById('txt-merchant-name');
      const name = txtName.value;

      if (!name) {
         errorToast('Merchant name is required');
         return txtName.focus();
      }

      try {

         showLoading();

         const res = await request.post(`/api/users/${this.props.user_id}/merchants`, { name });
         await this.props.onSuccess(res.data);

      } catch (err) {
         swal(String(err));
      } finally {
         hideLoading();
      }
   }

   render() {

      return <Dialog open={this.props.open}>

         <DialogTitle>ADD MERCHANT</DialogTitle>

         <DialogContent>
            <TextField
               fullWidth
               label="Merchant name"
               id="txt-merchant-name"
               size="small"
               variant="standard"
            />
         </DialogContent>

         <DialogActions>
            <Button variant="contained" onClick={this.submit}>
               SAVE
            </Button>

            <Button onClick={this.props.close}>
               CANCEL
            </Button>
         </DialogActions>
      </Dialog>
   }
}

export default AddMerchant;