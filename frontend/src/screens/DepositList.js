import React from 'react';
import { connect } from 'react-redux';
import Authed from './Authed';


class DepositList extends Authed {
	render() {
		if (!this.props.login){
			return super.unauthorized();
		}
		return (
			<div>
				Hi, this is the deposits page for {this.props.login.username}.
			</div>
		)
	}
}


const mapStateToProps = state => {
	return {
		login: state.login
	}
}

export default connect(mapStateToProps, null)(DepositList);
