import React from 'react';
import { connect } from 'react-redux';
import { get, put } from '../lib/ajax';
import Authed from './Authed';
import { updateLogin } from '../actions/actions';


class User extends Authed {
	constructor(props){
		super(props);
		this.state = { email: '', full_name: '', username: '', is_admin: '', is_manager: '' };
		this.bind = this.bind.bind(this);
	}

	componentDidMount(){
		let userID = this.props.params ?
			this.props.params.userID :
			(this.props.login ? this.props.login.id : null);
		if (!userID){
			return;
		}
		this.setState({userID: userID});
		get(`users/${userID}`, this.props.login.token, (user) => {
			console.log(user);
			this.setState(user);
		});
	}

	bind(e) {
		let attr = e.target.getAttribute('data-bind');
		this.setState({ [attr]: e.target.value });
	}

	updateUser(){
		let pack = {
			email: this.state.email,
			username: this.state.username,
			full_name: this.state.full_name,
			is_admin: this.state.is_admin,
			is_manager: this.state.is_manager
		};
		put(`users/${this.state.userID}`, pack, this.props.login.token, (res) => {
			console.log(res);
			if (this.props.login.id === this.state.userID){
				this.props.updateLogin(pack);
			}
		});
	}

	render() {
		if (!this.props.login) {
			return super.unauthorized();
		}
		if (!this.state.email) {
			return (
				<div>Loading</div>
			);
		}
		return (
			<div>
				Hi, this is the user page {this.props.params ? this.props.params.userID : this.props.login.username}.

				<form className="uk-form-horizontal uk-margin-large">

					<legend className="uk-legend">User Information</legend>

					<div className="uk-margin">
						<label className="uk-form-label" htmlFor="name">Name</label>
						<div className="uk-form-controls">
							<input className="uk-input" id="name" type="text" placeholder="Full Name"
								value={this.state.full_name} onChange={this.bind} data-bind="full_name" />
        		</div>
					</div>

					<div className="uk-margin">
						<label className="uk-form-label" htmlFor="username">Username</label>
						<div className="uk-form-controls">
							<input className="uk-input" id="username" type="text" placeholder="username"
								value={this.state.username} onChange={this.bind} data-bind="username" />
						</div>
					</div>

					<div className="uk-margin">
						<label className="uk-form-label" htmlFor="email">Email</label>
						<div className="uk-form-controls">
							<input className="uk-input" id="email" type="email" placeholder="sample@example.com"
								value={this.state.email} onChange={this.bind} data-bind="email" />
						</div>
					</div>

					{(this.state.is_admin || this.state.is_manager) ?
					<div className="uk-margin uk-grid-small uk-child-width-auto uk-grid">
						<label><input className="uk-checkbox" type="checkbox"
							checked={this.state.is_admin} onChange={this.bind} data-bind="is_admin" /> Admin?</label>
						<label><input className="uk-checkbox" type="checkbox"
							checked={this.state.is_manager} onChange={this.bind} data-bind="is_manager" /> Manager?</label>
       		</div>
					: ""}

					<button type="button" className="uk-button uk-button-primary" onClick={this.updateUser.bind(this)}>SAVE</button>

				</form>

				<hr className="uk-divider-icon" />

				<form className="uk-form-horizontal uk-margin-large">

					<legend className="uk-legend">Change Password</legend>

					<div className="uk-margin">
						<label className="uk-form-label" htmlFor="cp">Current Password</label>
						<div className="uk-form-controls">
							<input className="uk-input" id="cp" type="password" placeholder="Current Password" />
						</div>
					</div>

					<div className="uk-margin">
						<label className="uk-form-label" htmlFor="np">New Password</label>
						<div className="uk-form-controls">
							<input className="uk-input" id="np" type="password" placeholder="New Password" />
						</div>
					</div>

					<div className="uk-margin">
						<label className="uk-form-label" htmlFor="vp">Verify Password</label>
						<div className="uk-form-controls">
							<input className="uk-input" id="vp" type="password" placeholder="Verify Password" />
						</div>
					</div>

					<button type="button" className="uk-button uk-button-primary" onClick={() => this.props.onLogin(this.state)}>SAVE</button>

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
		updateLogin: (user) => {
			dispatch(updateLogin(user));
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(User);
