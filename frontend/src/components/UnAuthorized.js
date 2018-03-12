import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class UnAuthorized extends Component {
	render() {
		return (
			<div>
				Either you don't have access to this resource or there seems to be nothing here.

				<p>But here's a <Link to="/">page</Link> that works.</p>
			</div>
		)
	}
}
