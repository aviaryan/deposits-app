export const SET_LOGIN = 'SET_LOGIN'
export const UNSET_LOGIN = 'UNSET_LOGIN'
export const UPDATE_LOGIN = 'UPDATE_LOGIN'
export const SET_USERS = 'SET_USERS'
export const UPDATE_USER = 'UPDATE_USER'
export const DELETE_USERS = 'DELETE_USERS'
export const SET_DEPOSITS = 'SET_DEPOSITS'
export const UPDATE_DEPOSIT = 'UPDATE_DEPOSIT'
export const DELETE_DEPOSITS = 'DELETE_DEPOSITS'

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

export function setUsers(users){
	return {
		type: SET_USERS,
		users: users
	}
}

export function updateUser(user) {
	return {
		type: UPDATE_USER,
		user: user
	}
}

export function deleteUsers(users) {
	return {
		type: DELETE_USERS,
		users: users
	}
}

export function setDeposits(deposits) {
	return {
		type: SET_DEPOSITS,
		deposits: deposits
	}
}

export function updateDeposit(deposit) {
	return {
		type: UPDATE_DEPOSIT,
		deposit: deposit
	}
}

export function deleteDeposits(deposits) {
	return {
		type: DELETE_DEPOSITS,
		deposits: deposits
	}
}
