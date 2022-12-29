import { css } from "@emotion/css";
import { Button, Divider, Grid, Hidden } from "@mui/material";
import swal from "sweetalert";
import AddMerchant from "../components/AddMerchant";
import { hideLoading, showLoading } from "../loading";
import request from "../request";
import Page from "./Page";
import TimeAgo from 'react-timeago';
import Pos from "../components/Pos";
import Deposit from "../components/Deposit";
import sse from "../sse";
import PaymentApproval from "../components/PaymentApproval";
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import RefreshIcon from '@mui/icons-material/Refresh';
import PaidIcon from '@mui/icons-material/Paid';




const divAccountDetailsStyle = css({
   display: 'grid',
   gridTemplateColumns: '1fr 1fr',

   '& > *:nth-child(odd)': {
      fontWeight: 'bold'
   },

   '& > *': {
      fontSize: 14,
      padding: '10px 0',
      borderBottom: '1px solid #ddd'
   }

})


class Dashboard extends Page {

   state = {
      dataFetched: false,
      errorOccurred: false,
      addMerchantModalOpen: false,
      pos: null,
      depositModalOpen: false,
      paymentToBeApproved: null,
      fingerprintAvailable: false,
   }

   openPaymentApproval = (paymentToBeApproved) => {
      return this.updateState({ paymentToBeApproved })
   }

   closePaymentApproval = (success=false) => {

      const update = { paymentToBeApproved: null };

      if (success) {
         update.balance = this.state.balance - this.state.paymentToBeApproved.amount;
      }

      return this.updateState(update)
   }

   logout = async () => {

      try {

         showLoading();
         await request.delete('/api/login');

         window.App.redirect('/');

      } catch (err) {
         swal(String(err));
      } finally {
         hideLoading();
      }
   }

   openDepositModal = () => {
      return this.updateState({ depositModalOpen: true });
   }

   closeDepositModal = () => {
      return this.updateState({ depositModalOpen: false });
   }

   closePOS = () => {
      return this.updateState({ pos: null });
   }

   openPOS = (e) => {
      const name = e.target.getAttribute('data-merchant-name');
      const id = e.target.getAttribute('data-merchant-id');
      const pos = { name, id };
      return this.updateState({ pos });
   }

   openAddMerchantModal = () => {
      return this.updateState({ addMerchantModalOpen: true })
   }

   closeAddMerchantModal = () => {
      return this.updateState({ addMerchantModalOpen: false })
   }

   onMerchantAdded = async (merchant) => {
      const merchants = [ ...this.state.merchants, merchant ];
      await this.updateState({ merchants, addMerchantModalOpen: false });
   }

   _enrollFingeprint(secret) {
      return new Promise((resolve, reject) => {
         window.Fingerprint.registerBiometricSecret({
            description: "Enroll your finger",
            secret,
            invalidateOnEnrollment: true,
            disableBackup: true,
          }, resolve, (err) => {
            reject (new Error(err.message));
          });
      });
   }

   enrollFingeprint = async () => {

      try {

         showLoading()

         const res = await request.get('/api/users/secret');
         const { secret } = res.data;
         await this._enrollFingeprint(secret);

      } catch (err) {
         swal(String(err));
      } finally {
         hideLoading();
      }
   }

   fetchData = async () => {

      try {

         showLoading();

         const res = await request.get('/api/users/logged');
         const {
            merchants,
            balance,
            name,
            surname,
            createdAt,
            account_no,
            id,
            account_type
         } = res.data;

         await this.updateState({
            id,
            account_type,
            merchants,
            balance,
            name,
            surname,
            createdAt,
            account_no,
            errorOccurred: false,
            dataFetched: true
         });

      } catch (err) {

         if (err.status === 401 || err.status === 403) {
            await swal('You need to login');
            window.App.redirect('/');
         } else {

            swal(String(err));

            await this.updateState({
               errorOccurred: true,
               dataFetched: false,
            });
         }

      } finally {
         hideLoading();
      }
   }

   onPaymentApproval = (data) => {
      const { transactionId, amount } = data;
      sse.emit(`payment-approval-${transactionId}`);

      // update balance
      const balance = this.state.balance + amount;
      return this.updateState({ balance });
   }

   onPaymentRejection = (data) => {
      const { transactionId } = data;
      sse.emit(`payment-rejection-${transactionId}`, data);
   }

   componentWillUnmount() {
      sse.off('payment-request', this.openPaymentApproval);
      sse.off('payment-approval', this.onPaymentApproval);
      sse.off('payment-rejection', this.onPaymentRejection);
   }

   componentDidMount() {

      this.fetchData();

      sse.on('payment-request', this.openPaymentApproval);
      sse.on('payment-approval', this.onPaymentApproval);
      sse.on('payment-rejection', this.onPaymentRejection);


      document.addEventListener('deviceready', () => {
         const fingerprintAvailable = !!window.Fingerprint;
         this.updateState({ fingerprintAvailable });
      });

   }


   _render() {


      let errorJSX;

      if (this.state.errorOccurred) {
         errorJSX = <div className="fill-container vh-align">
            <div style={{ width: 200}}>
               Something went wrong.<br/>
               <Button onClick={this.fetchData}>
                  RETRY
               </Button>
            </div>
         </div>
      }

      let contentJSX;

      if (!this.state.errorOccurred && this.state.dataFetched) {

         let merchantsJSX;

         if (this.state.merchants.length) {
            merchantsJSX = this.state.merchants.map(merchant => {
               return <div style={{ 
                     borderBottom: '1px solid #ddd', 
                     padding: '10px 0',
                     display: 'grid',
                     gridTemplateColumns: 'auto 100px'
                  }}
               >
                  <div>
                     <div>{merchant.name}</div>
                     <span className="grey-text">Created <TimeAgo date={merchant.createdAt} /></span>
                  </div>

                  <div>
                     <div className="fill-container vh-laign">
                        <Button 
                           variant="contained" 
                           color="secondary" 
                           data-merchant-id={merchant.id}
                           data-merchant-name={merchant.name}
                           onClick={this.openPOS}
                        >
                           POS
                        </Button>
                     </div>
                  </div>

               </div>
            })
         } else {
            merchantsJSX = <p>No mechant accounts added to this account</p>
         }


         let depositJSX;

         if (this.state.account_type === 'teller') {
            depositJSX = <>
               <Button style={{ color: 'white' }} onClick={this.openDepositModal}>
                  <PaidIcon ></PaidIcon>
                  DEPOSIT
               </Button>

               <Deposit
                  open={this.state.depositModalOpen}
                  close={this.closeDepositModal}
               />
            </>
         }

         let enrollJSX;

         if (this.state.fingerprintAvailable) {
            enrollJSX = <Button style={{ color: 'white' }} onClick={this.enrollFingeprint}>
               <FingerprintIcon />
               ENROLL
            </Button>
         } 

         contentJSX = <> 

            <Grid container spacing={2}>

               <Grid item xs={12} md={6}>

                  <div style={{ padding: '0 20px', }}>
                     <h2 className="grey-text">ACCOUNT DETAILS</h2>

                     <div className={divAccountDetailsStyle}>

                        <span>NAME</span>
                        <span>{this.state.name} {this.state.surname}</span>

                        <span>ACCOUNT NUMBER</span>
                        <span>{this.state.account_no}</span>

                        <span>ACCOUNT CREATED</span>
                        <span>{(new Date(this.state.createdAt)).toDateString()}</span>

                        <span>BALANCE</span>
                        <span>{this.state.balance}</span>

                     </div>
                  </div>

               </Grid>


               <Hidden mdUp>
                  <Grid xs={12} style={{ marginTop: 10 }}>
                     <Divider />
                  </Grid>
               </Hidden>

               <Grid item xs={12} md={6}>

                  <div className="fill-container vh-align">
                     <div style={{ padding: '0 10px', }}>
                        <h2 className="grey-text center-align" style={{ marginBottom: 0 }}>BALANCE</h2>
                        <span style={{ fontSize: 100 }}>{this.state.balance}</span>
                     </div>
                  </div>
               </Grid>

               <Grid item xs={12}>
                  <Divider style={{ marginTop: 20 }} />
               </Grid>

               <Grid item xs={12} md={6}>
      
                  <div style={{ padding: '0 20px', }}>
                     <h2 className="grey-text">MERCHANTS</h2>
                     {merchantsJSX}
                  </div>
               </Grid>
            </Grid>

            <div 
               style={{
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: '#1979D7',
                  boxShadow: '5px 5px 15px rgba(0,0,0,0.4)',
                  textAlign: 'right',
                  paddingRight: 30,
               }}
            >
               {enrollJSX}
               
               <Button style={{ color: 'white' }} onClick={this.openAddMerchantModal}>
                  <AddIcon />
                  ADD MERCHANT
               </Button>

               {depositJSX}

               <Button style={{ color: 'white' }} onClick={this.fetchData}>
                  <RefreshIcon />
                  REFRESH
               </Button>

               <Button style={{ color: 'white' }} onClick={this.logout}>
                  <LogoutIcon />
                  LOGOUT
               </Button>

            </div>

            <AddMerchant
               open={this.state.addMerchantModalOpen}
               close={this.closeAddMerchantModal}
               onSuccess={this.onMerchantAdded}
               user_id={this.state.id}
            />

            <Pos
               open={!!this.state.pos}
               close={this.closePOS}
               data={this.state.pos}
            />

            <PaymentApproval
               open={!!this.state.paymentToBeApproved}
               data={this.state.paymentToBeApproved}
               close={this.closePaymentApproval}
               fingerprintAvailable={this.state.fingerprintAvailable}
            />

         </>
      }

      return <>
         {errorJSX}
         {contentJSX}
      </>
   }
}

export default Dashboard;