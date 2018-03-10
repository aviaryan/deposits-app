import UIkit from 'uikit';

export function notify(message, timeout = 1400){
	UIkit.notification({
		message: `Error: ${message}`,
		status: 'warning',
		pos: 'top-center',
		timeout: timeout
	});
}
