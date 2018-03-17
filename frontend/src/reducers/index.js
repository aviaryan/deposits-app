import { combineReducers } from 'redux'
import login from './login'
import users from './users'
import deposits from './deposits'
import share from './share'

const depositsApp = combineReducers({
	login,
	users,
	deposits,
	share
})

export default depositsApp
