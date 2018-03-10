import React, { Component } from 'react';
import { connect } from 'react-redux';
// import jquery from 'jquery';
import { post, get } from '../lib/ajax';
import { setLogin } from '../actions/actions';
import { notify } from '../lib/notify';


class Welcome extends Component {
	constructor(props){
		super(props);
		this.state = {email: '', password: ''};
		this.bind = this.bind.bind(this);
	}

	bind(e) {
		let attr = e.target.getAttribute('data-bind');
		this.setState({ [attr]: e.target.value });
	}

	componentDidUpdate(){
		if (this.props.login) {
			this.props.history.push('/deposits');
		}
	}

	render(){
		return (
			<div>
				<h2 className="uk-heading-primary">Welcome to Deposits!</h2>

				<form>
					<fieldset className="uk-fieldset">
						<legend className="uk-legend">Log In</legend>
						<div className="uk-margin">
							<input className="uk-input" type="text" value={this.state.email} placeholder="Email"
								onChange={this.bind} data-bind="email"/>
        		</div>
						<div className="uk-margin">
							<input className="uk-input" type="password" value={this.state.password} placeholder="Password"
								onChange={this.bind} data-bind="password"/>
						</div>
						<button type="button" className="uk-button uk-button-primary" onClick={() => this.props.onLogin(this.state)}>LOG IN</button>
					</fieldset>
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

const mapDispatchToProps = dispatch => {
	return {
		onLogin: (state) => {
			post('auth/login', state, (res) => {
				get('users/user', res.token, (user) => {
					dispatch(setLogin(user, res.token));
				});
			}, (xhr) => {
				console.log(xhr.responseJSON);
				notify(xhr.responseJSON['message']);
			});
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Welcome);
