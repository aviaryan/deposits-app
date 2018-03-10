export const SET_LOGIN = 'SET_LOGIN'
export const UNSET_LOGIN = 'UNSET_LOGIN'
export const UPDATE_LOGIN = 'UPDATE_LOGIN'

export function setLogin(user, token){
	return {
		type: SET_LOGIN,
		user: user,
		token: token
	}
}

export function unsetLogin(){
	return {
		type: UNSET_LOGIN
	}
}

export function updateLogin(user){
	return {
		type: UPDATE_LOGIN,
		user: user
	}
}
