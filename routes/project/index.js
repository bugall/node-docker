const express = require('express');
const router = express.Router();
const Docker = require('../../lib');
const docker = new Docker();

router.get('/start/:projectId', function (req, res) {
    const projectId = req.params['projectId'];
    docker.startContainer({ projectId: projectId }).then(() => {
        res.send({
            ack: 'SUCCESS',
            msg: ''
        });
    }).catch((err) => {
        console.log(err.stack);
        res.send({
            ack: 'error',
            msg: err.message
        });
    });
});

router.get('/stop/:projectId', function (req, res) {
    const projectId = req.params['projectId'];
    docker.stopContainer({ projectId: projectId }).then(() => {
        res.send({
            ack: 'SUCCESS',
            msg: ''
        });
    }).catch((err) => {
        console.log(err.stack);
        res.send({
            ack: 'error',
            msg: err.message
        });
    });
});

router.post('/:projectId', function(req,res, next) {
	const projectId = req.params['projectId'];
	const image = req.body['image'];
	const entrypoint = req.body['entrypoint'];
    
    docker.createContainer({ 
        projectId: projectId, 
        image: image,
        entrypoint:entrypoint 
    }).then(() => {
        res.send({
            ack: 'SUCCESS',
            msg: ''
        });
    }).catch((err) => {
        console.log(err);
        res.send({
            ack: 'error',
            msg: err.message
        });
    });
});

router.get('/image/list', function(req, res, next) {
    docker.imagesList().then((data) => {
        res.send({
            ack: 'SUCCESS',
            msg: data
        });
    }).catch((err) => {
        res.send({
            ack: 'SUCCESS',
            msg: err.message
        });
    });
});

router.get('/container/status', function(req, res, next) {
    docker.imagesList().then((data) => {
        res.send({
            ack: 'SUCCESS',
            msg: data
        });
    }).catch((err) => {
        res.send({
            ack: 'SUCCESS',
            msg: err.message
        });
    });
});

router.get('/backup/:projectId', function(req, res, next) {
    const projectId = req.params['projectId'];
    const name = req.query['name'];
    const version = req.query['version'];

    docker.commitContainer({
        projectId: projectId,
        name: name,
        version: version
    }).then((data) => {
        res.send({
            ack: 'SUCCESS',
            msg: data
        });
    }).catch((err) => {
        console.log(err);
        res.send({
            ack: 'error',
            msg: err.message
        });
    });
});
module.exports = router;
