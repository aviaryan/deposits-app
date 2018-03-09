import React, { Component } from 'react';
import { Menu, Container } from 'semantic-ui-react';
// import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    return (
			<Container>
				<Menu>
					<Menu.Header content="Deposits"/>
				</Menu>
			</Container>
    );
  }
}

export default App;
