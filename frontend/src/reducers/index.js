import { combineReducers } from 'redux'
import login from './login'
import users from './users'

const depositsApp = combineReducers({
	login,
	users
})

export default depositsApp
