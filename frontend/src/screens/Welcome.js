import React, { Component } from 'react';
import { Header, Container } from 'semantic-ui-react'

export default class Welcome extends Component {
	render(){
		return (
			<Container text>
				<Header as='h2'>
					Welcome to Deposits!
				</Header>
				Manage your account settings and set e-mail preferences.
			</Container>
		)
	}
}
