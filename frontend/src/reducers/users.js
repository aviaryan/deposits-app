import { UPDATE_USERS } from '../actions/actions'
import { sortOnKeys } from '../lib/utils'

export default function login(state = {}, action) {
	switch (action.type) {
		case UPDATE_USERS:
			return sortOnKeys(makeDict(action.users))
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
