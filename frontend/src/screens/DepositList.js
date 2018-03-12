import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Authed from './Authed';


class DepositList extends Authed {
	render() {
		if (!this.props.login){
			return super.unauthorized();
		}
		return (
			<div>
				<div>
					<Link to="/deposits/new"><button className="uk-button uk-button-primary">NEW DEPOSIT</button></Link>
				</div>
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
