
import AppWrapper, { Route } from '@xavisoft/app-wrapper'
import './App.css';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';


function setDimensions() {
  
  const width = window.innerWidth + 'px';
  const height = window.innerHeight + 'px';

  document.documentElement.style.setProperty('--window-width', width);
  document.documentElement.style.setProperty('--window-height', height);

}

window.addEventListener('resize', setDimensions);
setDimensions();

function App() {
  return (
    <AppWrapper router="hash">

      <Navbar />

      <Route path="/" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/dashboard" component={Dashboard} />
    </AppWrapper>
  );
}

export default App;
