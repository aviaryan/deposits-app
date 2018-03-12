import $ from 'jquery';

const ROOT = 'http://localhost:5000/api/v1/';


function ajax(type, url, scb, body = null, token = null, ecb = null){
	let options = {
		type: type,
		url: ROOT + url,
		dataType: 'json',
		success: scb
	};
	// attach body
	if (body) {
		options['data'] = JSON.stringify(body);
		options['contentType'] = 'application/json';
	}
	// attach token
	if (token) {
		options['beforeSend'] = (request) => {
			request.setRequestHeader("Authorization", 'Bearer ' + token);
		};
	}
	// error
	if (ecb) {
		options['error'] = ecb;
	}
	// send
	$.ajax(options);
}

export function post(url, body, scb, ecb = null, token = null){
	ajax('POST', url, scb, body, token, ecb);
}

export function get(url, token, scb, ecb = null){
	ajax('GET', url, scb, null, token, ecb);
}

export function put(url, body, token, scb, ecb = null){
	ajax('PUT', url, scb, body, token, ecb);
}

export function del(url, token, scb, ecb = null) {
	ajax('DELETE', url, scb, null, token, ecb);
}
