


import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

const notyf = new Notyf();


// const errorToast = notyf.error;
// const successToast = notyf.success;

function errorToast(text) {
	notyf.error(text);
}

function successToast(text) {
	notyf.success(text);
}


export {
	errorToast,
	successToast,
	// toast
}