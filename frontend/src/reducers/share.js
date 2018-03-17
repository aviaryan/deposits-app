import { SET_VAR, UNSET_VAR } from '../actions/actions'

export default function share(state = {}, action) {
	switch (action.type) {
		case SET_VAR:
			state[action.key] = action.val
			return state
		case UNSET_VAR:
			if (state.hasOwnProperty(action.key)) {
				delete state[action.key]
			}
			return state
		default:
			return state
	}
}
