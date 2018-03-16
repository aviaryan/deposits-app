import { SET_DEPOSITS, UPDATE_DEPOSIT, DELETE_DEPOSITS } from '../actions/actions'
import { sortOnKeys, makeDict } from '../lib/utils'

export default function deposits(state = {}, action) {
	switch (action.type) {
		case SET_DEPOSITS:
			return sortOnKeys(makeDict(action.deposits))
		case UPDATE_DEPOSIT:
			let deposit = action.deposit
			if (state.hasOwnProperty(deposit.id)) {
				state[deposit.id] = { ...state[deposit.id], ...deposit }
			} else {
				// sorted automatically cause higher ID
				state[deposit.id] = deposit
			}
			return state
		case DELETE_DEPOSITS:
			let deposits = action.deposits
			deposits.forEach((deposit) => {
				if (state.hasOwnProperty(deposit.id)) {
					delete state[deposit.id]
				}
			})
			return state
		default:
			return state
	}
}
