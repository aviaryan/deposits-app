import React, { Component } from 'react';
import {
	BrowserRouter as Router,
	Route,
	Link
} from 'react-router-dom';
import { connect } from 'react-redux';
import { unsetLogin } from './actions/actions';
// import logo from './logo.svg';
import './App.css';
import Welcome from './screens/Welcome';
import Deposits from './screens/Deposits';
import User from './screens/User';


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
										<li><Link to="/profile">PROFILE</Link></li>
										<li className="uk-navbar-item"><button className="uk-button uk-button-default" onClick={this.props.onLogout}>LOGOUT</button></li>
									</ul>
								</div>
							}
						</nav>

						<div className="uk-container">
							<Route exact path='/' component={Welcome} />
							<Route exact path='/deposits' component={Deposits} />
							<Route path='/users/:userID' component={User} />
							<Route exact path='/profile' component={User} />
						</div>
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
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
