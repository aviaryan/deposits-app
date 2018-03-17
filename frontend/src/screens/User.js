import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { get, put, del, post } from '../lib/ajax';
import Authed from './Authed';
import { updateLogin, updateUser, deleteUsers, unsetLogin, clear } from '../actions/actions';
import { notify } from '../lib/notify';
import UIkit from 'uikit';


class User extends Authed {
	constructor(props){
		super(props);
		this.state = { email: '', full_name: '', username: '', is_admin: '', is_manager: '', cp: '', np: '', vp: '' };
	}

	componentDidMount(){
		// console.log(this.props);
		// ^ looking this, this.props.match.params sounds like a better choice
		let userID = this.props.match.params.userID ?
			this.props.match.params.userID :
			(this.props.login ? this.props.login.id : null);
		if (!userID){
			return;
		}
		this.setState({userID: parseInt(userID, 10)});
		// ^ userID is string
		get(`users/${userID}`, this.props.login.token, (user) => {
			console.log(user);
			this.setState(user);
			this.setState({ownProfile: this.props.login.id === user.id});
		}, (xhr) => {
			notify(xhr.responseJSON['message']);
			this.setState({four04: true});
		});
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
			this.props.updateUserStore(pack, this.state.ownProfile);
		});
	}

	deleteUser(){
		UIkit.modal.confirm('Do you want to delete this account?').then(() => {
			del(`users/${this.state.userID}`, this.props.login.token, (user) => {
				console.log(user);
				if (this.state.ownProfile) {
					// same user
					notify('Your account has been deleted. You have been logged out.');
					this.props.logOut();
				} else {
					this.setState({ deleted: true });
				}
				this.props.deleteUserStore(user);
			});
		}, () => {});
	}

	changePassword() {
		if ((this.props.login.is_admin || this.props.login.is_manager) && (!this.state.ownProfile)) {
			this.changePassword2();
		} else {
			post('auth/login', { email: this.state.email, password: this.state.cp }, () => {
				this.changePassword2();
			}, (xhr) => {
				// verify failed
				notify('The current password is wrong');
			});
		}
	}

	changePassword2() {
		if (this.state.np !== this.state.vp) {
			notify('The new password and verify password dont match');
			return;
		}
		let pack = {
			password: this.state.np
		};
		put(`users/${this.state.userID}`, pack, this.props.login.token, (res) => {
			notify('Password updated');
			if (this.state.ownProfile) {
				notify('Logging you out');
				this.props.logOut();
			}
		}, (xhr) => {
			notify(xhr.responseJSON['message']);
		});
	}

	render() {
		if (!this.props.login) {
			return super.unauthorized();
		}
		if (this.state.four04) {
			return super.unauthorized();
		}
		if (this.state.deleted) {
			return (
				<div>
					Account deleted.
					Click <a onClick={() => this.props.history.goBack()}>here</a> to go back to the previous page.
				</div>
			)
		}
		if (!this.state.email) {
			return (
				<div>Loading</div>
			);
		}
		return (
			<div>
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

					{(this.props.login.is_admin || this.props.login.is_manager) ?
					<div className="uk-margin uk-grid-small uk-child-width-auto uk-grid">
						<label><input className="uk-checkbox" type="checkbox"
							checked={this.state.is_admin} onChange={this.bind} data-bind="is_admin" /> Admin?</label>
						<label><input className="uk-checkbox" type="checkbox"
							checked={this.state.is_manager} onChange={this.bind} data-bind="is_manager" /> Manager?</label>
       		</div>
					: ""}

					<div uk-margin="true">
					<button type="button" className="uk-button uk-button-primary" onClick={this.updateUser.bind(this)}>SAVE</button>
					<button type="button" className="uk-button uk-margin-left uk-button-danger" onClick={this.deleteUser.bind(this)}>DELETE ACCOUNT</button>
					<Link to={`/users/${this.state.userID}/deposits/`}>
						<button type="button" className="uk-button uk-margin-left uk-button-secondary">
							View deposits
						</button>
					</Link>
					</div>

				</form>

				<hr className="uk-divider-icon" />

				<form className="uk-form-horizontal uk-margin-large">

					<legend className="uk-legend">Change Password</legend>

					{this.state.ownProfile &&
					<div className="uk-margin">
						<label className="uk-form-label" htmlFor="cp">Current Password</label>
						<div className="uk-form-controls">
							<input className="uk-input" id="cp" type="password" placeholder="Current Password"
								value={this.state.cp} onChange={this.bind} data-bind="cp" />
						</div>
					</div>
					}

					<div className="uk-margin">
						<label className="uk-form-label" htmlFor="np">New Password</label>
						<div className="uk-form-controls">
							<input className="uk-input" id="np" type="password" placeholder="New Password"
								value={this.state.np} onChange={this.bind} data-bind="np" />
						</div>
					</div>

					<div className="uk-margin">
						<label className="uk-form-label" htmlFor="vp">Verify Password</label>
						<div className="uk-form-controls">
							<input className="uk-input" id="vp" type="password" placeholder="Verify Password"
								value={this.state.vp} onChange={this.bind} data-bind="vp" />
						</div>
					</div>

					<button type="button" className="uk-button uk-button-primary" onClick={this.changePassword.bind(this)} >SAVE</button>

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
		updateUserStore: (user, own=false) => {
			if (own) {
				dispatch(updateLogin(user));
			}
			dispatch(updateUser(user));
		},
		deleteUserStore: user => dispatch(deleteUsers([user])),
		logOut: () => {
			dispatch(unsetLogin());
			dispatch(clear());
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(User);
