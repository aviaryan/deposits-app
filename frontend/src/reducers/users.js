import { SET_USERS, UPDATE_USER, DELETE_USERS, CLEAR } from '../actions/actions'
import { sortOnKeys, makeDict, pageState } from '../lib/utils'

let pgState = JSON.parse(JSON.stringify(pageState))
pgState['limit'] = 10

export default function users(state = pgState, action) {
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
		case CLEAR:
			return pgState
		default:
			return state
	}
}
