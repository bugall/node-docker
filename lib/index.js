'use strict';
const Docker = require('dockerode');
const dbContainer = require('../common/mongo').container;
Promise = require('bluebird');

class DockerControler {
    constructor(opts) {
        this.docker = new Docker({socketPath: '/var/run/docker.sock'});
    }
    
    createContainer(opts) {
        console.log(123123);
        return this.docker.createContainer({
            Image: opts.image,
            AttachStdin: false,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
            Cmd: ['/bin/bash', '-c', 'cd /var/www && npm start'],
            OpenStdin: false,
            StdinOnce: false
        }).then((container) => {
            console.log(container);
            const p = [];
            p.push(dbContainer.create({
                project: opts.projectId,
                container: container.id
            }));
            p.push(container.start());
            return Promise.all(p);
        });
    }
    stopContainer(opts) {
        // get project container id
        let containerId = null;
        return dbContainer.findOne({ 
            project: opts.projectId 
        }).then((result) => {
            containerId = result.container;
            return this.docker.listContainers({
                all: true,
                filters: '{ "status": ["created"] }',
            });
        }).then((containers) => {
            const p = [];
            containers.forEach((containerInfo) => {
                if (containerInfo.Id === containerId) {
                    p.push(this.docker.getContainer(containerInfo.Id).stop());
                }
            });
            return Promise.all(p)
        });
    }
}
module.exports = DockerControler;
