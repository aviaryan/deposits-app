import React from 'react';
import Authed from './Authed';
import { connect } from 'react-redux';
import { get } from '../lib/ajax';
import autocomplete from 'autocomplete.js';
import { respError, success } from '../lib/notify';
// import jsPDF from 'jspdf';
import html2pdf from 'html2pdf.js';


class Report extends Authed {
	constructor(props) {
		super(props);
		this.state = {to_date: '', from_date: '', username: ''};
	}

	componentDidMount() {
		if (!this.props.login) {
			return;  // new page case
		}
		this.setState({username: this.props.login.username});
		if (this.props.login.is_admin) {
			this.initAutoComplete();
		}
	}

	report() {
		get(`users/usernames/${this.state.username}`, this.props.login.token, (user) => {
			let url = '';
			if (this.props.login.is_admin) {
				url = `deposits/all?user_id=${user.id}&`;
			} else {
				url = 'deposits?';
			}
			url += 'start=1&limit=1000000000&order_by=id.desc';
			['from_date', 'to_date'].forEach((val) => {
				if (this.state[val]) {
					url += `&${val}=${encodeURIComponent(this.state[val])}`;
				}
			});
			console.log(url);
			get(url, this.props.login.token, (deposits) => {
				console.log(deposits);
				// print report magic
				this.setState({deposits: deposits.results});
				success('Your file should start downloading in a moment');
				setTimeout(this.generate, 2000);
			}, respError);
		}, respError);
	}

	generate() {
		console.log('run');
		// let pdf = new jsPDF();
		// pdf.canvas.height = 72 * 11;
		// pdf.canvas.width = 72 * 8.5;
		html2pdf(document.getElementById('report'), {
			margin: 0,
			filename: `revenue_report.pdf`,
			html2canvas: { dpi: 192, letterRendering: true },
			jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
		});
	}

	initAutoComplete() {
		// HACK: dom not created in new case
		setTimeout(() => {
			autocomplete('#revenue-user-input', {}, {
				displayKey: suggestion => suggestion.username,
				source: this.queryUser.bind(this),
				templates: {
					suggestion: suggestion => suggestion.username + '(' + suggestion.id + ')'
				}
			});
		}, 1000);
	}

	queryUser(query, cb) {
		get(`users/_autocomplete?query=${encodeURIComponent(query)}`, this.props.login.token, (users) => {
			cb(users);
		});
	}

	render() {

		// for report
		// get deposits
		let deposits = [];
		let netLoss = 0.0;
		let netProfit = 0.0;
		(this.state.deposits || []).forEach((deposit) => {
			deposit.tax = Number(deposit.tax.toFixed(3));
			deposit.interest = Number(deposit.interest.toFixed(3));
			netLoss += deposit.tax;
			if (deposit.interest > 0) {
				netProfit += deposit.interest
			} else {
				netLoss += -1 * deposit.interest;
			}
			// rounding off
			deposits.push(
				<tr key={deposit.id}>
					<td>{deposit.id}</td>
					<td>{deposit.bank}</td>
					<td className="uk-text-nowrap">{deposit.account}</td>
					<td>{deposit.savings}</td>
					<td title={deposit.amount}>{deposit.amount.toFixed(2)}</td>
					<td>{deposit.interest_rate}</td>
					<td className={deposit.interest < 0 ? "color-red" : deposit.interest > 0 ? "color-green" : ""}>{deposit.interest}</td>
					<td>{deposit.tax_rate}</td>
					<td className={deposit.tax > 0 ? "color-red" : ""}>{deposit.tax}</td>
					<td>{deposit.start_date}</td>
					<td>{deposit.end_date}</td>
				</tr>
			);
		});

		return (
			<div>
				<form className="uk-form-horizontal uk-margin-large">

					<legend className="uk-legend">Revenue Report</legend>

					<p>Leave date fields empty (as it is) to get full report</p>

					{this.props.login.is_admin &&
						<div className="uk-margin">
							<label className="uk-form-label" htmlFor="form-stacked-select">User</label>
							<div className="uk-form-controls">
								<input type="text" id="revenue-user-input" placeholder="Search by username..." className="uk-input"
									value={this.state.username} onChange={this.bind} data-bind="username" />
							</div>
						</div>
					}

					<div className="uk-margin">
						<label className="uk-form-label" htmlFor="start">Start Date</label>
						<div className="uk-form-controls">
							<input className="uk-input" id="start" type="date"
								value={this.state.from_date} onChange={this.bind} data-bind="from_date" />
						</div>
					</div>

					<div className="uk-margin">
						<label className="uk-form-label" htmlFor="end">End Date</label>
						<div className="uk-form-controls">
							<input className="uk-input" id="end" type="date"
								value={this.state.to_date} onChange={this.bind} data-bind="to_date" />
						</div>
					</div>

					<div uk-margin="true">
						<button type="button" className="uk-button uk-button-primary" onClick={this.report.bind(this)}>GENERATE REPORT</button>
					</div>

				</form>

				{/* hidden report */}

				<div className="uk-hidden">
					{this.state.deposits &&
						<div id="report" className="uk-container uk-padding">
							<h2 className="uk-heading-divider">Revenue Report for {this.state.username}</h2>

							<div className="uk-text-small">
								<p>This document reports the profits/losses from deposits of the user.</p>
								{this.state.from_date &&
								<p><b>[FILTER]</b> Deposits done after: {this.state.from_date}</p>
								}
								{this.state.to_date &&
								<p><b>[FILTER]</b> Deposits done till: {this.state.to_date}</p>
								}
							</div>

							<table className="font-small-print uk-table uk-table-hover uk-table-middle uk-table-divider uk-table-striped uk-table-hover">
								<thead>
									<tr>
									<th className="uk-table-shrink font-header-print">ID</th>
										<th className="uk-table-shrink font-header-print">Bank</th>
										<th className="uk-table-shrink font-header-print">Account No</th>
										<th className="uk-table-shrink font-header-print">Principal ($)</th>
										<th className="uk-table-shrink font-header-print">Amount ($)</th>
										<th className="uk-table-shrink font-header-print">Interest Rate</th>
										<th className="uk-table-shrink font-header-print">Interest ($)</th>
										<th className="uk-table-shrink font-header-print">Tax Rate</th>
										<th className="uk-table-shrink font-header-print">Tax ($)</th>
										<th className="uk-table-shrink font-header-print">Start Date</th>
										<th className="uk-table-shrink font-header-print">End Date</th>
									</tr>
								</thead>
								<tbody>
									{deposits}
								</tbody>
							</table>

							{/* final */}
							<div className="uk-text-small">
								<b>Total Loss:</b> <span className="color-red">{netLoss.toFixed(3)}</span>
								<br />
								<b>Total Profit:</b> <span className="color-green">{netProfit.toFixed(3)}</span>
								<br />
								<b>Net: </b>
									<span className={netLoss > netProfit ? "color-red" : (netProfit > netLoss) ? "color-green" : ""}>{(netProfit - netLoss).toFixed(3)}
								</span>
							</div>
						</div>
					}
				</div>

			</div>
		)
	}
}

const mapStateToProps = state => {
	return {
		login: state.login
	}
}

export default connect(mapStateToProps, null)(Report);
