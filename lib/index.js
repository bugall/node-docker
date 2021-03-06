'use strict';
const Docker = require('dockerode');
const dbContainer = require('../common/mongo').container;
Promise = require('bluebird');
const MIN_PORT = 10000;
const _ = require('lodash');
const auth = {
    username: 'bugall',
    password: 'nijiaoa1',
    serveraddress: 'https://daocloud.io'
};

class DockerControler {
    constructor(opts) {
        this.docker = new Docker({socketPath: '/var/run/docker.sock'});
    }
    
    createContainer(opts) {
        let confirmContainerPort = null;
        return dbContainer.find({
            project: opts.projectId
        }).then((info) => {
            if (!_.isEmpty(info)) {
                throw new Error('Container has exist');
            }
            // find max port
            return dbContainer.findOne({}).sort({ port: -1 }).exec();
        }).then((project) => {
            console.log(project);
            confirmContainerPort = project.port ? project.port + 1 : MIN_PORT;
            const containerOpts = {
                Image: opts.image,
                AttachStdin: false,
                AttachStdout: true,
                AttachStderr: true,
                Tty: true,
                
                Cmd: ['/bin/bash', '-c', 'cd /var/www && npm start'],
                OpenStdin: false,
                StdinOnce: false
            };
            containerOpts.HostConfig = {};
            if (opts.processEnv) {
                containerOpts.Env = opts.processEnv;
            }
            if (opts.sharedFolder) {
                containerOpts.HostConfig.Binds = opts.sharedFolder;
            }
            if (opts.diskLimit) {
                containerOpts.HostConfig.DiskQuota= opts.diskLimit;
            }
            containerOpts.HostConfig.PortBindings = {
                '3000/tcp': [{
                    HostPort: JSON.stringify(confirmContainerPort)
                }]
            };
            
            return this.docker.createContainer(containerOpts);
        }).then((container) => {
            return container.start();
        }).then((container) => {
            return dbContainer.create({
                project: opts.projectId,
                container: container.id,
                port: confirmContainerPort
            });
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
                filters: '{ "status": ["created", "running"] }',
            });
        }).then((containers) => {
            const p = [];
            containers.forEach((containerInfo) => {
                if (containerInfo.Id === containerId) {
                    p.push(this.docker.getContainer(containerInfo.Id).stop());
                }
            });
            return Promise.all(p);
        });
    }
    startContainer(opts) {
        // get project container id
        let containerId = null;
        return dbContainer.findOne({ 
            project: opts.projectId 
        }).then((result) => {
            containerId = result.container;
            return this.docker.listContainers({
                all: true,
            });
        }).then((containers) => {
            const p = [];
            containers.forEach((containerInfo) => {
                if (containerInfo.Id === containerId) {
                    p.push(this.docker.getContainer(containerInfo.Id).start());
                }
            });
            return Promise.all(p);
        });
    }
    commitContainer(opts) {
        let containerId = null;
        return dbContainer.findOne({
            project: opts.projectId
        }).then((result) => {
            if (_.isEmpty(result)) {
                throw new Error('Container not exist');
            }
            containerId = result.container;
            return this.docker.getContainer(containerId).commit({
                container: containerId,
                repo: opts.name,
                tag: opts.version,
            });
        }).then((images) => {
            return images;
        });
    }
    pullImage(opts) {
        console.log(`${opts.repo}/${opts.name}:${opts.version}`);
        return new Promise((resolve, reject) => {
            this.docker.pull(`${opts.repo}/${opts.name}:${opts.version}`, {}, (err, result) => {
                reject(err);
            }, auth);
            resolve();
        });
    }
}
module.exports = DockerControler;
