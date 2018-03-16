import { SET_USERS, UPDATE_USER, DELETE_USERS } from '../actions/actions'
import { sortOnKeys, makeDict, pageState } from '../lib/utils'

export default function users(state = pageState, action) {
	switch (action.type) {
		case SET_USERS:
			action.response['results'] = sortOnKeys(makeDict(action.response['results']))
			return action.response
		case UPDATE_USER:
			let user = action.user
			if (state.results.hasOwnProperty(user.id)) {
				state.results[user.id] = { ...state.results[user.id], ...user }
			} else {
				// sorted automatically cause higher ID
				state.results[user.id] = user
			}
			return state
		case DELETE_USERS:
			let users = action.users
			users.forEach((user) => {
				if (state.results.hasOwnProperty(user.id)){
					delete state.results[user.id]
				}
			})
			return state
		default:
			return state
	}
}
