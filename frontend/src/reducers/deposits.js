import { SET_DEPOSITS, UPDATE_DEPOSIT, DELETE_DEPOSITS, CLEAR, SET_DEPOSITS_OTHER, CLEAR_DEPOSITS_OTHER } from '../actions/actions'
import { sortOnKeys, makeDict, pageState } from '../lib/utils'

let pgState = JSON.parse(JSON.stringify(pageState))

export default function deposits(state = pgState, action) {
	switch (action.type) {
		case SET_DEPOSITS:
			action.response['results'] = sortOnKeys(makeDict(action.response['results']))
			return {...state, ...action.response}  // dont overwrite over other
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
		case SET_DEPOSITS_OTHER:
			state.other = { ...state.other, ...action.other }
			return state
		case CLEAR_DEPOSITS_OTHER:
			state.other = {}
			return state
		case CLEAR:
			return pgState
		default:
			return state
	}
}
