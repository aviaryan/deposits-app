import React, { Component } from 'react';
import { connect } from 'react-redux';
// import jquery from 'jquery';
import { post } from '../lib/ajax';
// import { setLogin } from '../actions/actions';
// import { notify } from '../lib/notify';


class SignUp extends Component {
	constructor(props) {
		super(props);
		this.state = { email: '', password: '', username: '', verify: '', full_name: '' };
		this.bind = this.bind.bind(this);
	}

	bind(e) {
		let attr = e.target.getAttribute('data-bind');
		this.setState({ [attr]: e.target.value });
	}

	// componentDidUpdate() {
	// 	if (this.props.login) {
	// 		this.props.history.push('/deposits');
	// 	}
	// }

	render() {
		let btnText = 'SIGN UP';
		if (this.props.login){
			if (!(this.props.login.is_admin || this.props.login.is_manager)) {
				return (
					<div>
						Unauthorized
					</div>
				)
			} else {
				btnText = 'ADD USER';
			}
		}
		return (
			<div>
				<form>
					<fieldset className="uk-fieldset">
						<legend className="uk-legend">Register New User</legend>
						<div className="uk-margin">
							<input className="uk-input" type="text" value={this.state.full_name} placeholder="First Last"
								onChange={this.bind} data-bind="full_name" />
						</div>
						<div className="uk-margin">
							<input className="uk-input" type="email" value={this.state.email} placeholder="Email"
								onChange={this.bind} data-bind="email" />
						</div>
						<div className="uk-margin">
							<input className="uk-input" type="text" value={this.state.username} placeholder="username"
								onChange={this.bind} data-bind="username" />
						</div>
						<div className="uk-margin">
							<input className="uk-input" type="password" value={this.state.password} placeholder="Password"
								onChange={this.bind} data-bind="password" />
						</div>
						<div className="uk-margin">
							<input className="uk-input" type="password" value={this.state.verify} placeholder="Type password again"
								onChange={this.bind} data-bind="verify" />
						</div>
						<button type="button" className="uk-button uk-button-primary" onClick={() => this.props.onRegister(this.state)}>{btnText}</button>
					</fieldset>
				</form>
			</div>
		)
	}
}

const mapStateToProps = state => {
	return {
		login: state.login
	}
}

const mapDispatchToProps = dispatch => {
	return {
		onRegister: (state) => {
			if (state.password !== state.verify){
				console.log('password different');
				return;
			}
			let user = {username: state.username, email: state.email, password: state.password, full_name: state.full_name};
			post('users', user, (res) => {
				console.log(res);
			}, (xhr) => {
				console.log(xhr.responseJSON);
			})
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);
