import React, { Component } from 'react';
import { Menu, Container } from 'semantic-ui-react';
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
			<Container>
				<Menu>
					<Menu.Header content="Deposits"/>
				</Menu>

				<Router>
					<Route exact path='/' component={Welcome} />
				</Router>
			</Container>
    );
  }
}

export default App;
