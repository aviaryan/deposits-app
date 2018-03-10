import React, { Component } from 'react';
// import { connect } from 'react-redux';


class Authed extends Component {
	constructor(props) {
		super(props);
		if (!this.props.login) {
			this.props.history.push('/');
		}
	}

	shouldComponentUpdate(np, ns) {
		if (!np.login) {
			this.props.history.push('/');
			return false;
		}
		return super.shouldComponentUpdate(np, ns);
	}

	unauthorized(){
		return (
			<div>
				Unauthorized
			</div>
		)
	}
}

export default Authed;
