import { UPDATE_USERS } from '../actions/actions'

export default function login(state = [], action) {
	switch (action.type) {
		case UPDATE_USERS:
			return action.users
		default:
			return state
	}
}
