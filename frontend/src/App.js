import React, { Component } from 'react';
import {
	BrowserRouter as Router,
	Route
} from 'react-router-dom';
// import logo from './logo.svg';
import './App.css';
import Welcome from './screens/Welcome';
import Deposits from './screens/Deposits';


class App extends Component {
  render() {
    return (
			<div>

				<nav class="uk-navbar-container uk-margin" uk-navbar>
					<div class="uk-navbar-left">
						<a class="uk-navbar-item uk-logo" href="/">Deposits</a>
          </div>
        </nav>

        <Router>
        	<div class="uk-container">
            <Route exact path='/' component={Welcome} />
						<Route exact path='/deposits' component={Deposits} />
        	</div>
        </Router>
			</div>
    );
  }
}

export default App;
