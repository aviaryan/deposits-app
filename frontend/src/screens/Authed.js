import React, { Component } from 'react';
import UnAuthorized from '../components/UnAuthorized';


class Authed extends Component {
	constructor(props) {
		super(props);
		if (!this.props.login) {
			this.props.history.push('/');
		}
		// init empty state, avoids doing it again and again
		this.state = {};
		this.bind = this.bind.bind(this);
	}

	bind(e) {
		let attr = e.target.getAttribute('data-bind');
		this.setState({ [attr]: (e.target.getAttribute('type') === 'checkbox') ? !this.state[attr] : e.target.value });
	}

	shouldComponentUpdate(np, ns) {
		if (!np.login) {
			this.props.history.push('/');
			return false;
		}
		return true; // super.shouldComponentUpdate(np, ns);
		// this is a JS issue https://github.com/facebook/react/issues/3280
		// but its ok to return true here https://reactjs.org/docs/react-component.html#shouldcomponentupdate
	}

	unauthorized(){
		return (
			<UnAuthorized />
		)
	}
}

export default Authed;
