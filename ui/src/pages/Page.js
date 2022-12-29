
import Component from '@xavisoft/react-component';

class Page extends Component {

   _render() {
      return <div>Please implement <code>_render()</code></div>
   }

   render() {
      return <div className='page'>
         {this._render()}
      </div>
   }

}

export default Page;