import {SET_LOGIN, UNSET_LOGIN, UPDATE_LOGIN} from '../actions/actions'

export default function login(state = null, action){
	switch (action.type) {
		case SET_LOGIN:
			action.user['token'] = action.token
			return action.user
		case UNSET_LOGIN:
			return null
		case UPDATE_LOGIN:
			return { ...state, ...action.user }
		default:
			return state
	}
}
