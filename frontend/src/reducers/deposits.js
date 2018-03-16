import { SET_DEPOSITS, UPDATE_DEPOSIT, DELETE_DEPOSITS } from '../actions/actions'
import { sortOnKeys, makeDict, pageState } from '../lib/utils'

export default function deposits(state = pageState, action) {
	switch (action.type) {
		case SET_DEPOSITS:
			action.response['results'] = sortOnKeys(makeDict(action.response['results']))
			return action.response
		case UPDATE_DEPOSIT:
			let deposit = action.deposit
			if (state.results.hasOwnProperty(deposit.id)) {
				state.results[deposit.id] = { ...state.results[deposit.id], ...deposit }
			} else {
				// sorted automatically cause higher ID
				state.results[deposit.id] = deposit
			}
			return state
		case DELETE_DEPOSITS:
			let deposits = action.deposits
			deposits.forEach((deposit) => {
				if (state.results.hasOwnProperty(deposit.id)) {
					delete state.results[deposit.id]
				}
			})
			return state
		default:
			return state
	}
}
