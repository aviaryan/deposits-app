import UIkit from 'uikit';

export function notify(message, timeout = 1400, type = 'warning', position = 'top-center'){
	UIkit.notification({
		message: message,
		status: type,
		pos: position,
		timeout: timeout
	});
}

export function success(message){
	notify(message, 1400, 'success', 'bottom-right');
}

export function danger(message){
	notify(message, 1400, 'danger');
}

export function respError(xhr){
	if (xhr.responseJSON){
		danger(xhr.responseJSON['message']);
	} else {
		notify('There was an unknown error');
	}
}
