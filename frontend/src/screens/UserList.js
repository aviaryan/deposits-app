import React from 'react';
import { connect } from 'react-redux';
import { get } from '../lib/ajax';
import { Link } from 'react-router-dom';
import Authed from './Authed';
import { setUsers } from '../actions/actions';
import { respError } from '../lib/notify';


class UserList extends Authed {
	componentDidMount() {
		if (!this.props.login) {
			return;  // new page case
		}
		this.movePage(0);
	}

	movePage(dir) {
		let start = this.props.users.start;
		if (dir === 1) {
			start += this.props.users.limit;
		} else if (dir === -1) {
			start -= this.props.users.limit;
		} else if (dir === -2) {
			start = 1;
		}
		get(`users?order_by=id.desc&start=${start}&limit=${this.props.users.limit}`, this.props.login.token, (result) => {
			console.log(result);
			this.frontBtn.disabled = (!result['next']);
			this.backBtn.disabled = (!result['previous']);
			this.props.setUsers(result);
		}, (xhr) => {
			if (xhr.responseJSON['code'] === 404) {
				this.movePage(-2);
			} else {
				respError(xhr);
			}
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
		for (let id in this.props.users.results) {
			if (this.props.users.results.hasOwnProperty(id)) {
				const user = this.props.users.results[id];
				users.push(
					<tr key={id} className="hover-pointer"
						onClick={() => this.props.history.push(`/users/${user.id}`)}>
						<td>{user.id}</td>
						<td className="uk-text-nowrap">{user.full_name}</td>
						<td>{user.email}</td>
						<td>{user.username}</td>
						{this.props.login.is_admin &&
						<td><input className="uk-checkbox" type="checkbox" checked={user.is_admin} disabled="true" /></td>
						}
						{this.props.login.is_admin &&
						<td><input className="uk-checkbox" type="checkbox" checked={user.is_manager} disabled="true" /></td>
						}
					</tr>
				);
			}
		}
		users.reverse();
		// ^ new ID on top
		return (
			<div className="uk-overflow-auto">
				<div>
					<div className="uk-inline-block">
						<Link to="/users/new"><button className="uk-button uk-button-primary">NEW USER</button></Link>
					</div>
					<div className="uk-inline-block uk-float-right">
						<b>{Math.min(this.props.users.start, this.props.users.count)}</b>
							－<b>{Math.min(this.props.users.start + this.props.users.limit - 1, this.props.users.count)}
							</b> of <b>{this.props.users.count}</b>
						<button className="uk-button uk-button-default uk-button-small uk-margin-left"
							ref={btn => this.backBtn = btn} onClick={() => this.movePage(-1)}>◀</button>
						<button className="uk-button uk-button-default uk-button-small"
							ref={btn => this.frontBtn = btn} onClick={() => this.movePage(1)}>▶</button>
					</div>
				</div>
				<hr />

				<table className="uk-table uk-table-hover uk-table-middle uk-table-divider uk-table-striped uk-table-hover">
					<thead>
						<tr>
							<th className="uk-table-shrink">ID</th>
							<th className="uk-table-shrink">Name</th>
							<th>Email</th>
							<th>Username</th>
							{this.props.login.is_admin &&
							<th className="uk-table-shrink">Admin?</th>
							}
							{this.props.login.is_admin &&
							<th className="uk-table-shrink">Manager?</th>
							}
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
		setUsers: (result) => dispatch(setUsers(result))
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(UserList);
