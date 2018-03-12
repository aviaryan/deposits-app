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
