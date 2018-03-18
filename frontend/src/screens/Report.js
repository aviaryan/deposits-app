import React from 'react';
import Authed from './Authed';
import { connect } from 'react-redux';
// import { get } from '../lib/ajax';
// import { notify } from '../lib/notify';


class Report extends Authed {
	render() {
		return (
			<div>Working...</div>
		)
	}
}

const mapStateToProps = state => {
	return {
		login: state.login
	}
}

export default connect(mapStateToProps, null)(Report);
