import React from 'react';
import { connect } from 'react-redux';
import { get, post, put, del } from '../lib/ajax';
import Authed from './Authed';
import { notify } from '../lib/notify';


class Deposit extends Authed {
	constructor(props){
		super(props);
		this.state = { bank: '', account: '', savings: 0, start_date: (new Date()).toISOString().substr(0, 10),
			end_date: '', interest_rate: 0, tax_rate: 0, user_id: 0 };
	}

	componentDidMount(){
		if (!this.props.match.params.depositID) {
			this.setState({new: true});
		} else {
			this.setState({depositID: this.props.match.params.depositID});
			get(`deposits/${this.props.match.params.depositID}`, this.props.login.token, (deposit) => {
				console.log(deposit);
				this.setState(deposit);
			}, (xhr) => {
				notify(xhr.responseJSON['message']);
				this.setState({ four04: true });
			});
		}
	}

	saveRecord(){
		let pack = {};
		['bank', 'account', 'start_date', 'end_date'].forEach((key) => {
			pack[key] = this.state[key];
		});
		['savings', 'interest_rate', 'tax_rate'].forEach((key) => {
			pack[key] = parseFloat(this.state[key]);
		});
		if (this.props.login.is_admin && !this.state.new) {
			pack['user_id'] = parseInt(this.state.user_id, 10);
		}
		if (this.state.new) {
			post('deposits', pack, (deposit) => {
				console.log(deposit);
				notify('Deposit record saved');
				this.props.history.goBack();
				// TODO: not sure about behavior here
			}, (xhr) => {
				notify(xhr.responseJSON['message']);
			}, this.props.login.token);
		} else {
			put(`deposits/${this.state.depositID}`, pack, this.props.login.token, (deposit) => {
				console.log(deposit);
				// TODO: flash a inline message now
			});
		}
	}

	deleteRecord(){
		del(`deposits/${this.state.depositID}`, this.props.login.token, (deposit) => {
			console.log(deposit);
			this.setState({deleted: true});
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
					Record deleted.
					Click <a onClick={() => this.props.history.goBack()}>here</a> to go back to the previous page.
				</div>
			)
		}

		let legend = 'Edit Deposit';
		if (this.state.new) {
			legend = 'Add Deposit';
		}

		return (
			<div>
				<form className="uk-form-horizontal uk-margin-large">

					<legend className="uk-legend">{legend}</legend>

					<div className="uk-margin">
						<label className="uk-form-label" htmlFor="bank">Bank</label>
						<div className="uk-form-controls">
							<input className="uk-input" id="bank" type="text" placeholder="Bank Name"
								value={this.state.bank} onChange={this.bind} data-bind="bank" />
						</div>
					</div>

					<div className="uk-margin">
						<label className="uk-form-label" htmlFor="account">Account No</label>
						<div className="uk-form-controls">
							<input className="uk-input" id="account" type="text" placeholder="ACCOUNTN0"
								value={this.state.account} onChange={this.bind} data-bind="account" />
						</div>
					</div>

					<div className="uk-margin">
						<label className="uk-form-label" htmlFor="savings">Amount ($)</label>
						<div className="uk-form-controls">
							<input className="uk-input" id="savings" type="number" placeholder="42"
								value={this.state.savings} onChange={this.bind} data-bind="savings" />
						</div>
					</div>

					<div className="uk-margin">
						<label className="uk-form-label" htmlFor="interest">Interest Rate (%)</label>
						<div className="uk-form-controls">
							<input className="uk-input" id="interest" type="number" step="0.5"
								value={this.state.interest_rate} onChange={this.bind} data-bind="interest_rate" />
						</div>
					</div>

					<div className="uk-margin">
						<label className="uk-form-label" htmlFor="tax">Tax Rate (%)</label>
						<div className="uk-form-controls">
							<input className="uk-input" id="tax" type="number" step="0.5"
								value={this.state.tax_rate} onChange={this.bind} data-bind="tax_rate" />
						</div>
					</div>

					<div className="uk-margin">
						<label className="uk-form-label" htmlFor="start">Start Date</label>
						<div className="uk-form-controls">
							<input className="uk-input" id="start" type="date"
								value={this.state.start_date} onChange={this.bind} data-bind="start_date" />
						</div>
					</div>

					<div className="uk-margin">
						<label className="uk-form-label" htmlFor="end">End Date</label>
						<div className="uk-form-controls">
							<input className="uk-input" id="end" type="date"
								value={this.state.end_date} onChange={this.bind} data-bind="end_date" />
						</div>
					</div>

					{(this.props.login.is_admin && !this.state.new) &&
						<div className="uk-margin">
							<label className="uk-form-label" htmlFor="form-stacked-select">User</label>
							<div className="uk-form-controls">
								<select className="uk-select" id="form-stacked-select"
									value={this.state.user_id} onChange={this.bind} data-bind="user_id" >
									<option value="5">Normal</option>
									<option value="6">Admin</option>
								</select>
							</div>
						</div>
					}

					<div uk-margin="true">
						<button type="button" className="uk-button uk-button-primary" onClick={this.saveRecord.bind(this)}>SAVE</button>
						<button type="button" className="uk-button uk-margin-left uk-button-danger" onClick={this.deleteRecord.bind(this)}>DELETE RECORD</button>
					</div>

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

export default connect(mapStateToProps, null)(Deposit);
