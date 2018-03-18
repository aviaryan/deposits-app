import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { unsetLogin } from './../actions/actions';
import { get } from '../lib/ajax';
import { respError } from '../lib/notify';


class Verify extends Component {
	constructor(props){
		super(props);
		this.state = {};
	}

	componentDidMount(){
		console.log(this.props);
		let query = this.props.location.search || '';
		if (!query){
			this.setState({ fail: true });
			return;
		}
		// log out of current session
		this.props.logOut();
		get('users/_verify' + query, null, (user) => {
			this.setState({ user: user });
		}, (xhr) => {
			this.setState({ fail: true });
			respError(xhr);
		});
	}

	render() {
		if (this.state.user) {
			return (
				<div>
					Verified account for {this.state.user.email}.

					<p>You may go to <Link to="/">homepage</Link> to login now.</p>
				</div>
			)
		}
		if (this.state.fail){
			return (
				<div>
					Failed to verify account. Make sure that the verification URL is correct.
				</div>
			)
		}
		return (
			<div>Working...</div>
		)
	}
}

const mapDispatchToProps = dispatch => {
	return {
		logOut: () => {
			dispatch(unsetLogin());
		}
	}
}

// NOTODO: update users state, not needed though
export default connect(null, mapDispatchToProps)(Verify);
