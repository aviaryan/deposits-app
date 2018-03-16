import React, { Component } from 'react';
import {
	BrowserRouter as Router,
	Route,
	Link,
	Switch
} from 'react-router-dom';
import { connect } from 'react-redux';
import { unsetLogin, clear } from './actions/actions';
// import logo from './logo.svg';
import './App.css';
import Welcome from './screens/Welcome';
import DepositList from './screens/DepositList';
import User from './screens/User';
import UserList from './screens/UserList';
import SignUp from './screens/SignUp';
import Verify from './screens/Verify';
import Deposit from './screens/Deposit';


class App extends Component {
  render() {
		return (
			<div>
				<Router>
					<div>
						<nav className="uk-navbar-container uk-margin" uk-navbar="true">
							<div className="uk-navbar-left">
								<Link className="uk-navbar-item uk-logo" to="/">Deposits</Link>
							</div>
							{this.props.login &&
								<div className="uk-navbar-right">
									<ul className="uk-navbar-nav">
										<li><Link to="/profile">@{this.props.login.username}</Link></li>
										{(this.props.login.is_admin || this.props.login.is_manager) &&
											<li><Link to="/users">USERS</Link></li>
										}
										<li className="uk-navbar-item"><button className="uk-button uk-button-danger" onClick={this.props.onLogout}>LOGOUT</button></li>
									</ul>
								</div>
							}
							{!this.props.login &&
								<div className="uk-navbar-right">
									<ul className="uk-navbar-nav">
									<li><Link to="/signup"><button className="uk-button uk-button-secondary">SIGN UP</button></Link></li>
									</ul>
								</div>
							}
						</nav>

						<div className="uk-container"><Switch>
							<Route exact path='/' component={Welcome} />
							<Route exact path='/deposits' component={DepositList} />
							<Route exact path='/users/new' component={SignUp} />
							<Route exact path='/signup' component={SignUp} />
							<Route exact path='/users/:userID/deposits' component={DepositList} />
							<Route path='/users/:userID' component={User} />
							<Route exact path='/profile' component={User} />
							<Route exact path='/users' component={UserList} />
							<Route exact path='/verify' component={Verify} />
							<Route exact path="/deposits/new" component={Deposit} />
							<Route exact path="/deposits/:depositID" component={Deposit} />
						</Switch></div>
					</div>
				</Router>
			</div>
		);
  }
}

const mapStateToProps = state => {
	return {
		login: state.login
	}
}

const mapDispatchToProps = dispatch => {
	return {
		onLogout: () => {
			dispatch(unsetLogin());
			dispatch(clear());
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
