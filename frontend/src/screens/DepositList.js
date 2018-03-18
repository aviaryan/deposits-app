import React from 'react';
import { connect } from 'react-redux';
import { get } from '../lib/ajax';
import Authed from './Authed';
import { setDeposits, setVar, setDepositsOther, clearDepositsOther } from '../actions/actions';


class DepositList extends Authed {
	constructor(props){
		super(props);
		this.defaultState = { bank: '', min_amount: '', max_amount: '', from_date: '', to_date: '' };
		this.state = this.defaultState;
	}

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

	movePage(dir, otherUser = null, userID = null, filterEnabled = false) {
		let start = this.props.deposits.start;
		if (dir === 1) {
			start += this.props.deposits.limit;
		} else if (dir === -1) {
			start -= this.props.deposits.limit;
		} else if (dir === -2) {
			start = 1;
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
		url += `order_by=id.desc&start=${start}&limit=${this.props.deposits.limit}`;
		// set filters
		let currentUser = otherUser ? userID : this.props.login.id;
		if ((this.props.deposits.other.enabled || filterEnabled)) {
			if (this.props.deposits.other.activeUser === currentUser) {
				// same user, filter settings apply
				let update = {};
				['bank', 'from_date', 'to_date', 'min_amount', 'max_amount'].forEach((val) => {
					if (this.state[val]) {
						url += `&${val}=${encodeURIComponent(this.state[val])}`;
					} else if (this.props.deposits.other[val]) {
						url += `&${val}=${encodeURIComponent(this.props.deposits.other[val])}`;
						update[val] = this.props.deposits.other[val];
					}
				});
				// update state if not updated already, that way fields will show with values
				this.setState(update);
			} else {
				// dont apply clear them
				this.props.clearDepositsOther();
			}
		}
		console.log(url);

		get(url, this.props.login.token, (result) => {
			console.log(result);
			this.frontBtn.disabled = (!result['next']);
			this.backBtn.disabled = (!result['previous']);
			this.props.setDeposits(result);
			this.props.setDepositsOther({ activeUser: otherUser ? userID : this.props.login.id });
			// ^ important for store based rendering
		}, (xhr) => {
			// other user state, not valid now
			if (xhr.responseJSON['code'] === 404) {
				this.movePage(-2);
			}
		});
	}

	newDeposit() {
		if (this.state.otherUser) {
			this.props.setVar('deposit_user', this.state.otherUser.username);
		}
		this.props.history.push("/deposits/new");
	}

	filterBtn() {
		this.props.setDepositsOther({...this.state, ...{enabled: true}});
		this.movePage(0, null, null, true);
	}

	clearBtn() {
		this.setState(this.defaultState);
		this.props.clearDepositsOther();
		this.movePage(-2, null, null, false);
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
						<td title={deposit.amount}>{deposit.amount.toFixed(2)}</td>
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
						<b>{Math.min(this.props.deposits.start, this.props.deposits.count)}</b>
						－<b>{Math.min(this.props.deposits.start + this.props.deposits.limit - 1, this.props.deposits.count)}
						</b> of <b>{this.props.deposits.count}</b>
						<button className="uk-button uk-button-default uk-button-small uk-margin-left"
							ref={btn => this.backBtn = btn} onClick={() => this.movePage(-1)}>◀</button>
						<button className="uk-button uk-button-default uk-button-small"
							ref={btn => this.frontBtn = btn} onClick={() => this.movePage(1)}>▶</button>
					</div>
				</div>

				<div className="uk-margin-top">
					<div className="uk-inline-block">
						<input type="text" placeholder="Bank" className="uk-input uk-form-width-small"
							value={this.state.bank} onChange={this.bind} data-bind="bank" />
					</div>

					<div className="uk-margin-left uk-inline-block">
						<input type="number" placeholder="Min Amount" className="uk-input uk-form-width-small"
							value={this.state.min_amount} onChange={this.bind} data-bind="min_amount" />
					</div>

					<div className="uk-margin-left uk-inline-block">
						<input type="number" placeholder="Max Amount" className="uk-input uk-form-width-small"
							value={this.state.max_amount} onChange={this.bind} data-bind="max_amount" />
					</div>

					<div className="uk-margin-left uk-inline-block">
						From:
						<input type="date" className="uk-input uk-margin-left uk-form-width-medium width-170"
							value={this.state.from_date} onChange={this.bind} data-bind="from_date" />
					</div>

					<div className="uk-margin-left uk-inline-block">
						To:
						<input type="date" className="uk-input uk-margin-left uk-form-width-medium width-170"
							value={this.state.to_date} onChange={this.bind} data-bind="to_date" />
					</div>

					<div className="uk-inline-block uk-align-right">
						<button className="uk-button uk-button-secondary uk-button-small" onClick={this.filterBtn.bind(this)}>Filter</button>
						<button className="uk-button uk-button-danger uk-button-small uk-margin-left" onClick={this.clearBtn.bind(this)}>Clear</button>
					</div>
				</div>

				<hr />

				<table className="uk-table uk-table-hover uk-table-middle uk-table-divider uk-table-striped uk-table-hover">
					<thead>
						<tr>
							<th className="uk-table-shrink">ID</th>
							<th className="uk-table-shrink">Bank</th>
							<th className="uk-table-shrink">Account No</th>
							<th className="uk-table-shrink">Principal</th>
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
		setDepositsOther: other => dispatch(setDepositsOther(other)),
		clearDepositsOther: () => dispatch(clearDepositsOther()),
		setVar: (key, val) => dispatch(setVar(key, val))
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(DepositList);
