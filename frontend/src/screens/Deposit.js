import React from 'react';
import { connect } from 'react-redux';
import { get, post, put, del } from '../lib/ajax';
import Authed from './Authed';
import { respError, success } from '../lib/notify';
import autocomplete from 'autocomplete.js';
import UIkit from 'uikit';
import { unsetVar } from '../actions/actions';


class Deposit extends Authed {
	constructor(props){
		super(props);
		this.state = { bank: '', account: '', savings: 0, start_date: (new Date()).toISOString().substr(0, 10),
			end_date: '', interest_rate: 0, tax_rate: 0, username: '' };
	}

	componentDidMount(){
		if (!this.props.match.params.depositID) {
			this.setState({new: true});
			if (this.props.share.deposit_user) {
				this.setState({ userEnabled: true, username: this.props.share.deposit_user });
				this.props.unsetVar('deposit_user');
				this.initAutoComplete();
			}
		} else {
			// edit deposit case
			this.setState({ depositID: this.props.match.params.depositID, userEnabled: true });
			get(`deposits/${this.props.match.params.depositID}`, this.props.login.token, (deposit) => {
				console.log(deposit);
				this.setState(deposit);
				// username state
				get(`users/${deposit.user_id}`, this.props.login.token, (user) => {
					this.setState({username: user.username});
				}, respError);
				if (this.props.login.is_admin) {
					this.initAutoComplete();
				}
			}, (xhr) => {
				respError(xhr);
				this.setState({ four04: true });
			});
		}
	}

	initAutoComplete() {
		// HACK: dom not created in new case
		setTimeout(() => {
			autocomplete('#username-input', {}, {
				displayKey: suggestion => suggestion.username,
				source: this.queryUser.bind(this),
				templates: {
					suggestion: suggestion => suggestion.username + '(' + suggestion.id + ')'
				}
			});
		}, 1000);
	}

	queryUser(query, cb){
		get(`users/_autocomplete?query=${encodeURIComponent(query)}`, this.props.login.token, (users) => {
			cb(users);
		});
	}

	saveRecord(){
		if (this.props.login.is_admin && this.state.userEnabled) {
			let temp = document.getElementById('username-input').value;
			get(`users/usernames/${temp}`, this.props.login.token, (user) => {
				this.saveRecord2({user_id: user.id});
			}, respError);
		} else {
			this.saveRecord2({});
		}
	}

	saveRecord2(pack){
		['bank', 'account', 'start_date', 'end_date'].forEach((key) => {
			pack[key] = this.state[key];
		});
		['savings', 'interest_rate', 'tax_rate'].forEach((key) => {
			pack[key] = parseFloat(this.state[key]);
		});
		if (this.state.new) {
			post('deposits', pack, (deposit) => {
				console.log(deposit);
				success('Deposit record saved!');
				this.props.history.goBack();
				// TODO: not sure about behavior here
			}, respError, this.props.login.token);
		} else {
			put(`deposits/${this.state.depositID}`, pack, this.props.login.token, (deposit) => {
				console.log(deposit, pack);
				success('Deposit record updated!');
			}, respError);
		}
	}

	deleteRecord(){
		UIkit.modal.confirm('Do you want to delete this deposit?').then(() => {
			del(`deposits/${this.state.depositID}`, this.props.login.token, (deposit) => {
				console.log(deposit);
				this.setState({ deleted: true });
			}, respError);
		}, () => {});
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
						<label className="uk-form-label" htmlFor="savings">Principal Amount ($)</label>
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

					{(this.props.login.is_admin && this.state.userEnabled) &&
						<div className="uk-margin">
							<label className="uk-form-label" htmlFor="form-stacked-select">User</label>
							<div className="uk-form-controls">
								<input type="text" id="username-input" placeholder="Search by username..." className="uk-input"
									value={this.state.username} onChange={this.bind} data-bind="username" />
							</div>
						</div>
					}

					<div uk-margin="true">
						<button type="button" className="uk-button uk-button-primary" onClick={this.saveRecord.bind(this)}>SAVE</button>
						{!this.state.new &&
						<button type="button" className="uk-button uk-margin-left uk-button-danger" onClick={this.deleteRecord.bind(this)}>DELETE RECORD</button>
						}
					</div>

				</form>
			</div>
		)
	}
}


const mapStateToProps = state => {
	return {
		login: state.login,
		share: state.share
	}
}

const mapDispatchToProps = dispatch => {
	return {
		unsetVar: key => dispatch(unsetVar(key))
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Deposit);
