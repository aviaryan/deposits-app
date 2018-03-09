import React, { Component } from 'react';
import {
	BrowserRouter as Router,
	Route
} from 'react-router-dom';
// import logo from './logo.svg';
import './App.css';
import Welcome from './screens/Welcome';


class App extends Component {
  render() {
    return (
			<div>

				<nav class="uk-navbar-container uk-margin" uk-navbar>
					<div class="uk-navbar-left">
						<a class="uk-navbar-item uk-logo" href="/">Deposits</a>
          </div>
        </nav>

        <div class="uk-container">
          <Router>
            <Route exact path='/' component={Welcome} />
          </Router>
        </div>
			</div>
    );
  }
}

export default App;
