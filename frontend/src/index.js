import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
// redux
import { createStore } from 'redux';
import depositsApp from './reducers/index';
import { Provider } from 'react-redux';

// uikit
import 'uikit/dist/css/uikit.min.css';
import Icons from 'uikit/dist/js/uikit-icons';
import UIkit from 'uikit';

UIkit.use(Icons);

let store = createStore(depositsApp);


ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('root')
);
registerServiceWorker();
