import React from 'react';
import { connect } from 'react-redux';
import { get } from '../lib/ajax';
import { Link } from 'react-router-dom';
import Authed from './Authed';
import { setUsers } from '../actions/actions';


class UserList extends Authed {
	componentDidMount() {
		if (!this.props.login) {
			return;  // new page case
		}
		get(`users`, this.props.login.token, (users) => {
			console.log(users);
			this.props.setUsers(users);
		});
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
					<tr key={id} className="hover-pointer"
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
				<div>
					<Link to="/users/new"><button className="uk-button uk-button-primary">NEW USER</button></Link>
				</div>
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
		setUsers: users => dispatch(setUsers(users))
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(UserList);
