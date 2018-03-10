import React, { Component } from 'react';
import { connect } from 'react-redux';


class User extends Component {
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

	render() {
		if (!this.props.login) {
			return (
				<div>
					Unauthorized
				</div>
			)
		}
		return (
			<div>
				Hi, this is the user page {this.props.params ? this.props.params.userID : this.props.login.id}.
			</div>
		)
	}
}


const mapStateToProps = state => {
	return {
		login: state.login
	}
}

export default connect(mapStateToProps, null)(User);
