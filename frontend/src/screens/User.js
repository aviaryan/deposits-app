import React from 'react';
import { connect } from 'react-redux';
import Authed from './Authed';


class User extends Authed {
	render() {
		if (!this.props.login) {
			return super.unauthorized();
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
