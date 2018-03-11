import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
// import jquery from 'jquery';
import { get } from '../lib/ajax';
// import { setLogin } from '../actions/actions';
import { notify } from '../lib/notify';


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
		get('users/_verify' + query, null, (user) => {
			this.setState({ user: user });
		}, (xhr) => {
			this.setState({ fail: true });
			notify(xhr.responseJSON['message']);
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

// TODO: update users state
export default connect(null, null)(Verify);
