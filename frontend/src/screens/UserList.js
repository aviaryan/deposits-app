import React from 'react';
import { connect } from 'react-redux';
import { get } from '../lib/ajax';
import Authed from './Authed';
import { updateUsers } from '../actions/actions';


class UserList extends Authed {
	// constructor(props) {
	// 	super(props);
	// 	// this.state = { email: '', full_name: '', username: '', is_admin: '', is_manager: '' };
	// 	// this.bind = this.bind.bind(this);
	// }

	componentDidMount() {
		if (!this.props.login) {
			return;  // new page case
		}
		get(`users`, this.props.login.token, (users) => {
			console.log(users);
			this.props.updateUsers(users);
		});
	}

	// bind(e) {
	// 	let attr = e.target.getAttribute('data-bind');
	// 	this.setState({ [attr]: e.target.value });
	// }

	updateUser() {
		// let pack = {
		// 	email: this.state.email,
		// 	username: this.state.username,
		// 	full_name: this.state.full_name,
		// 	is_admin: this.state.is_admin,
		// 	is_manager: this.state.is_manager
		// };
		// put(`users/${this.state.userID}`, pack, this.props.login.token, (res) => {
		// 	console.log(res);
		// 	if (this.props.login.id === this.state.userID) {
		// 		this.props.updateLogin(pack);
		// 	}
		// });
	}

	render() {
		if (!this.props.login) {
			return super.unauthorized();
		}
		if (!(this.props.login.is_admin || this.props.login.is_manager)){
			return super.unauthorized();
		}
		if (!this.props.users) {
			return (
				<div>Loading</div>
			);
		}
		// get users
		let users = [];
		for (let id in this.props.users) {
			if (this.props.users.hasOwnProperty(id)) {
				const user = this.props.users[id];
				users.push(
					<tr key={user.id} className="hover-pointer"
						onClick={() => this.props.history.push(`/users/${user.id}`)}>
						<td>{user.id}</td>
						<td className="uk-text-nowrap">{user.full_name}</td>
						<td>{user.email}</td>
						<td>{user.username}</td>
						<td><input className="uk-checkbox" type="checkbox" checked={user.is_admin} disabled="true" /></td>
						<td><input className="uk-checkbox" type="checkbox" checked={user.is_manager} disabled="true" /></td>
					</tr>
				);
			}
		}
		users.reverse();
		// ^ new ID on top
		return (
			<div className="uk-overflow-auto">
				<table className="uk-table uk-table-hover uk-table-middle uk-table-divider uk-table-striped uk-table-hover">
					<thead>
						<tr>
							<th className="uk-table-shrink">ID</th>
							<th className="uk-table-shrink">Name</th>
							<th>Email</th>
							<th>Username</th>
							<th className="uk-table-shrink">Admin?</th>
							<th className="uk-table-shrink">Manager?</th>
						</tr>
					</thead>
					<tbody>
						{users}
					</tbody>
				</table>
			</div>
		)
	}
}

const mapStateToProps = state => {
	return {
		login: state.login,
		users: state.users
	}
}

const mapDispatchToProps = dispatch => {
	return {
		updateUsers: (users) => {
			dispatch(updateUsers(users));
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(UserList);