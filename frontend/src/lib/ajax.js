import $ from 'jquery';

const ROOT = 'http://localhost:5000/api/v1/';


function ajax(type, url, scb, body = null, token = null){
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
	// send
	$.ajax(options);
}

export function post(url, body, scb){
	ajax('POST', url, scb, body);
}

export function get(url, token, scb){
	ajax('GET', url, scb, null, token);
}

export function put(url, body, token, scb){
	ajax('PUT', url, scb, body, token);
}
