import { combineReducers } from 'redux'
import login from './login'
import users from './users'
import deposits from './deposits'

const depositsApp = combineReducers({
	login,
	users,
	deposits
})

export default depositsApp
