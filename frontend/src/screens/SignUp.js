import React, { Component } from 'react';
import { connect } from 'react-redux';
// import jquery from 'jquery';
import { post } from '../lib/ajax';
import { respError, success, danger } from '../lib/notify';
import { updateUser } from '../actions/actions';
// import { setLogin } from '../actions/actions';
// import { notify } from '../lib/notify';


class SignUp extends Component {
	constructor(props) {
		super(props);
		this.state = { email: '', password: '', username: '', verify: '', full_name: '', is_admin: false, is_manager: false };
		this.bind = this.bind.bind(this);
	}

	componentDidMount(){
		// sorry
		document.getElementById('signUpBtn').style.display = 'none';
	}

	bind(e) {
		let attr = e.target.getAttribute('data-bind');
		this.setState({ [attr]: (e.target.getAttribute('type') === 'checkbox') ? !this.state[attr] : e.target.value });
	}

	createAccount(){
		this.props.onRegister(this.state, this.props.login, () => {
			if (this.props.login) {
				success('Account was created. You may create another account or go back.');
			} else {
				this.setState({accountCreated: true});
			}
		});
	}

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
		// account created?
		if (this.state.accountCreated) {
			return (
				<h3>
					Your account has been created. Please check your inbox for confirmation email.
				</h3>
			);
		}
		return (
			<div>
				<form>
					<fieldset className="uk-fieldset">
						<legend className="uk-legend">Register New User</legend>
						<div className="uk-margin">
							<input className="uk-input" type="text" value={this.state.full_name} placeholder="Full Name"
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

						{(this.props.login && this.props.login.is_admin) ?
							<div className="uk-margin uk-grid-small uk-child-width-auto uk-grid">
								<label><input className="uk-checkbox" type="checkbox"
									checked={this.state.is_admin} onChange={this.bind} data-bind="is_admin" /> Admin?</label>
								<label><input className="uk-checkbox" type="checkbox"
									checked={this.state.is_manager} onChange={this.bind} data-bind="is_manager" /> Manager?</label>
							</div>
							: null}

						<button type="button" className="uk-button uk-button-primary" onClick={this.createAccount.bind(this)}>{btnText}</button>
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
		onRegister: (state, login, cb) => {
			// password different check
			if (state.password !== state.verify){
				danger('Passwords don\'t match');
				console.log('password different');
				return;
			}
			// create user pack
			let user = {username: state.username, email: state.email, password: state.password, full_name: state.full_name};
			// admin user
			if (login) {
				user['is_verified'] = true;
				user['is_admin'] = state.is_admin;
				user['is_manager'] = state.is_manager;
				// ^ backend checks these anyway
			}
			console.log("creating", user);
			// post
			post('users', user, (res) => {
				console.log(res);
				// store it in store
				dispatch(updateUser(res));
				// successful creation callback
				cb();
			}, respError, login ? login.token : null);
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);
