import { UPDATE_USERS, UPDATE_USER, DELETE_USERS } from '../actions/actions'
import { sortOnKeys, makeDict } from '../lib/utils'

export default function users(state = {}, action) {
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
		case DELETE_USERS:
			let users = action.users
			users.forEach((user) => {
				if (state.hasOwnProperty(user.id)){
					delete state[user.id]
				}
			})
			return state
		default:
			return state
	}
}
