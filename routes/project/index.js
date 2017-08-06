const express = require('express');
const router = express.Router();
const Docker = require('../../lib');
const docker = new Docker();

router.get('/start/:projectId', function (req, res) {
	const projectId = req.params['projectId'];
	// get proejctId config info
});

router.get('/stop/:projectId', function (req, res) {
    const projectId = req.params['projectId'];
    docker.stopContainer({ projectId }).then(() => {
        res.send({
            ack: 'SUCCESS',
            msg: ''
        });
    }).catch((err) => {
        console.log(err.stack);
        res.send({
            ack: 'error',
            msg: ''
        });
    });
});

router.post('/:projectId', function(req,res, next) {
	const projectId = req.params['projectId'];
	const image = req.body['image'];
	const entrypoint = req.body['entrypoint'];
    
    docker.createContainer({ projectId, image, entrypoint }).then(() => {
        res.send({
            ack: 'SUCCESS',
            msg: ''
        });
    }).catch((err) => {
        res.send({
            ack: 'error',
            msg: ''
        });
    });
});

router.get('/backup/:projectId', function(req, res, next) {
	docker.createImage({fromImage: ''}, function (err, stream) {
		stream.pipe(process.stdout);
	});
})

module.exports = router;
