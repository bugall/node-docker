const express = require('express');
const router = express.Router();
const Docker = require('../../lib');
const docker = new Docker();

router.get('/image/pull', function (req, res) {
    const name = req.query['name'];
    const version = req.query['version'];
    const repo = req.query['repo'];

    docker.pullImage({ 
        repo: repo,
        name: name,
        version: version
    }).then(() => {
        res.send({
            ack: 'SUCCESS',
            msg: '开始下载镜像, 请稍后查看'
        });
    }).catch((err) => {
        console.log(err.stack);
        res.send({
            ack: 'error',
            msg: err.message
        });
    });
});

module.exports = router;