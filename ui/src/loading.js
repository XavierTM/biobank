
import { Loading } from 'notiflix/build/notiflix-loading-aio';


function showLoading(text='') {
   Loading.pulse(text);
}


function hideLoading() {
   Loading.remove();
}



export {
    hideLoading,
    showLoading
}