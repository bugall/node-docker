const express = require('express');
const router = express.Router();
const compose = require('../lib')
const projects = {
	'p000001': {
		service: {
			name: 'service',
			port: 10000,
			path: __dirname + '',
		},
		db: {
			name: 'db',
			port: 10001,
			paht:
		}
	}
}


router.get('/start/:projectId', function (req, res) {
	const projectId = req.params['projectId'];
	// get proejctId config info
	const compose = new Compose({
	})
	
})

router.get('/stop/:projectId', function (req, res) {
})

router.post('/:projectId', function(req,res, next) {
	const projectId = req.params['projectId'];
	const code_repo = req.body['code_repo'];
	const entrypoint = req.body['entrypoint'];
	
	

	res.send({
		ack: 'SUCESS',
		msg: ''
	});
})

module.exports = router;
