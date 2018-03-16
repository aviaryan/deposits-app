import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { get } from '../lib/ajax';
import Authed from './Authed';
import { setDeposits } from '../actions/actions';


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
		let url = (otherUser) ? `deposits/all?user_id=${userID}` : `deposits`;
		get(url, this.props.login.token, (deposits) => {
			console.log(deposits);
			this.props.setDeposits(deposits['results']);  // TODO: fix
		});
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
		for (let id in this.props.deposits) {
			if (this.props.deposits.hasOwnProperty(id)) {
				const deposit = this.props.deposits[id];
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
					<Link to="/deposits/new"><button className="uk-button uk-button-primary">NEW DEPOSIT</button></Link>
				</div>
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
		deposits: state.deposits
	}
}

const mapDispatchToProps = dispatch => {
	return {
		setDeposits: deposits => dispatch(setDeposits(deposits))
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(DepositList);
