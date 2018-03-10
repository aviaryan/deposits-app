import React, { Component } from 'react';
import {
	BrowserRouter as Router,
	Route
} from 'react-router-dom';
import { connect } from 'react-redux';
import { unsetLogin } from './actions/actions';
// import logo from './logo.svg';
import './App.css';
import Welcome from './screens/Welcome';
import Deposits from './screens/Deposits';


class App extends Component {
  render() {
    return (
			<div>

				<nav className="uk-navbar-container uk-margin" uk-navbar="true">
					<div className="uk-navbar-left">
						<a className="uk-navbar-item uk-logo" href="/">Deposits</a>
          </div>

					{this.props.login &&
						<div className="uk-navbar-right uk-navbar-item">
							<button className="uk-button uk-button-default" onClick={this.props.onLogout}>LOGOUT</button>
						</div>
					}
        </nav>

        <Router>
        	<div className="uk-container">
            <Route exact path='/' component={Welcome} />
						<Route exact path='/deposits' component={Deposits} />
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
