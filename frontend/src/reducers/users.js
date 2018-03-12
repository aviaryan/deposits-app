import { UPDATE_USERS, UPDATE_USER } from '../actions/actions'
import { sortOnKeys } from '../lib/utils'

export default function login(state = {}, action) {
	switch (action.type) {
		case UPDATE_USERS:
			return sortOnKeys(makeDict(action.users))
		case UPDATE_USER:
			let user = action.user
			if (state.hasOwnProperty(user.id)) {
				state[user.id] = { ...state[user.id], ...user }
			} else {
				// sorted automatically cause higher ID
				state[user.id] = user
			}
			return state
		default:
			return state
	}
}

function makeDict(arr){
	let dct = {}
	arr.forEach((item) => {
		dct[item.id] = item
	})
	return dct
}
