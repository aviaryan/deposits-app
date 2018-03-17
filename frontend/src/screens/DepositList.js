import React from 'react';
import { connect } from 'react-redux';
import { get } from '../lib/ajax';
import Authed from './Authed';
import { setDeposits, setVar } from '../actions/actions';


class DepositList extends Authed {
	componentDidMount(){
		// get if others page or own
		let userID = this.props.match.params.userID ?
			this.props.match.params.userID :
			(this.props.login ? this.props.login.id : null);
		if (!userID) {
			return;
		} else {
			userID = parseInt(userID, 10);
		}
		// find deposit page status
		let otherUser = false;
		if (this.props.login.id !== userID) {
			if (this.props.login.is_admin) {
				otherUser = true;
				this.setState({ otherUserID: userID });
				get(`users/${userID}`, this.props.login.token, (user) => {
					this.setState({ otherUser: user });
				});
			} else {
				this.setState({ four04: true });
				return;
			}
		}
		// fetch deposits for that user
		this.movePage(0, otherUser, userID);
	}

	movePage(dir, otherUser = null, userID = null) {
		let start = this.props.deposits.start;
		if (dir === 1) {
			start += this.props.deposits.limit;
		} else if (dir === -1) {
			start -= this.props.deposits.limit;
		}
		// cuz setState doesn't work quickly
		if (otherUser === null) {
			otherUser = this.state.otherUser;
		}
		if (otherUser && userID === null) {
			// not needed otherwise
			userID = this.state.otherUser.id;
		}
		// fetch
		let url = otherUser ? `deposits/all?user_id=${userID}&` : `deposits?`;
		get(url + `start=${start}&limit=${this.props.deposits.limit}`, this.props.login.token, (result) => {
			console.log(result);
			this.frontBtn.disabled = (!result['next']);
			this.backBtn.disabled = (!result['previous']);
			this.props.setDeposits(result);
		});
	}

	newDeposit() {
		if (this.state.otherUser) {
			this.props.setVar('deposit_user', this.state.otherUser.id);
		}
		this.props.history.push("/deposits/new");
	}

	render() {
		if (!this.props.login){
			return super.unauthorized();
		}
		if (this.state.four04) {
			return super.unauthorized();
		}
		if (!this.props.deposits) {
			return (
				<div>Loading</div>
			);
		}

		// get deposits
		let deposits = [];
		for (let id in this.props.deposits.results) {
			if (this.props.deposits.results.hasOwnProperty(id)) {
				const deposit = this.props.deposits.results[id];
				deposits.push(
					<tr key={id} className="hover-pointer"
						onClick={() => this.props.history.push(`/deposits/${deposit.id}`)}>
						<td>{deposit.id}</td>
						<td>{deposit.bank}</td>
						<td className="uk-text-nowrap">{deposit.account}</td>
						<td>{deposit.savings}</td>
						<td>{deposit.interest_rate}</td>
						<td>{deposit.tax_rate}</td>
						<td>{deposit.start_date}</td>
						<td>{deposit.end_date}</td>
					</tr>
				);
			}
		}
		deposits.reverse();
		// ^ new ID on top
		return (
			<div>
				<div>
					<h4>Deposits by {this.state.otherUser ? this.state.otherUser.username : "me"}</h4>
				</div>

				<div>
					<div className="uk-inline-block">
						<button className="uk-button uk-button-primary" onClick={this.newDeposit.bind(this)}>NEW DEPOSIT</button>
					</div>
					<div className="uk-inline-block uk-float-right">
						<b>{this.props.deposits.start}</b>－<b>{Math.min(this.props.deposits.start + this.props.deposits.limit - 1, this.props.deposits.count)}
						</b> of <b>{this.props.deposits.count}</b>
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
							<th className="uk-table-shrink">Bank</th>
							<th className="uk-table-shrink">Account No</th>
							<th className="uk-table-shrink">Amount</th>
							<th className="uk-table-shrink">Interest Rate</th>
							<th className="uk-table-shrink">Tax Rate</th>
							<th className="uk-table-shrink">Start Date</th>
							<th className="uk-table-shrink">End Date</th>
						</tr>
					</thead>
					<tbody>
						{deposits}
					</tbody>
				</table>
			</div>
		)
	}
}


const mapStateToProps = state => {
	return {
		login: state.login,
		deposits: state.deposits,
		share: state.share
	}
}

const mapDispatchToProps = dispatch => {
	return {
		setDeposits: result => dispatch(setDeposits(result)),
		setVar: (key, val) => dispatch(setVar(key, val))
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(DepositList);
