import Component from "@xavisoft/react-component";
import AppBar from '@mui/material/AppBar';



class Navbar extends Component {

   setDimensions = () => {
      const navbar = document.getElementById('navbar');
      
      const width = navbar.offsetWidth + 'px';
      const height = navbar.offsetHeight + 'px';

      document.documentElement.style.setProperty('--navbar-width', width);
      document.documentElement.style.setProperty('--navbar-height', height);
   }

   componentWillUnmount() {
      this.resizeOberver.disconnect();
   }

   componentDidMount() {
      const resizeOberver = new window.ResizeObserver(this.setDimensions);
      resizeOberver.observe(document.getElementById('navbar'));
      this.resizeOberver = resizeOberver;

      this.setDimensions();
   }

   render() {
      return <AppBar style={{ paddingLeft: 20 }} id="navbar">
         <h1><b style={{ color: 'yellow' }}>BIOMETRIC</b><b>BANK</b></h1>
      </AppBar>
   }
}


export default Navbar;