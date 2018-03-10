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
		const users = this.props.users.map((user) =>
			<tr key={user.id}>
				<td>{user.id}</td>
				<td>{user.full_name}</td>
				<td>{user.email}</td>
				<td>{user.username}</td>
			</tr>
		);
		return (
			<div className="uk-overflow-auto">
				<table className="uk-table uk-table-hover uk-table-middle uk-table-divider">
					<thead>
						<tr>
							<th className="uk-table-shrink">ID</th>
							<th className="uk-table-expand">Name</th>
							<th className="uk-table-expand">Email</th>
							<th className="uk-width-shrink">Username</th>
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
