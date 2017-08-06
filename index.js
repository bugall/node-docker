'use strict'
const j2y = require('json2yaml');
const fs = require('fs');
const _ = require('lodash');
Promise = require('bluebird');

class Docker {
	constructor() {
		this.exec = require('child_process').exec;
	}
	run(command) {
		console.log('docker command:', command)
		return new Promise((resolve, reject) => {
			this.exec(command, (err, stdout, stderr) => {
				if (err || stderr) {
					reject(err)
				} else {
					console.log('command finish:', command)
					resolve(stdout)
				}
			})
		})
	}
	format(data, action) {
		
	}
}
class ComposeController{
	constructor(config) {
		this.downloadTime = null;
		this.template =  {
			version: "2",
			services: {}
		}
		this.opts = {};
		this.docker = new Docker();

		this.opts.openTTY = config.openTTY || true;
		if (!config.image) throw new Error('Must have confirm image');
		this.opts.image = config.image;

		this.testProjectConfig = {
			'12de3151': {
				service: {
					name: 'servicce',
					port: '10000',
					path: '/Users/bugall/nodejs/austr/docker/testNodejsProject',
					command: 'node /var/www/bin/www',
				},
				db : {
					name: 'db',
					port: '10001',
					path: '/Users/bugall/nodejs/austr/docker/testDb',
					command: 'mongod ',
				}
			}
		}
	}
	writeConfig(projectId, data) {
		return new Promise((resolve, reject) => {
			const path = __dirname + '/compose-config';
			if (!fs.existsSync(path)){
				fs.mkdirSync(path);
			}

			if (!fs.existsSync(__dirname + 'testNodejsProject')){
				fs.mkdirSync(__dirname + 'testNodejsProject');
			}


			if (!fs.existsSync(__dirname + 'testDb')){
				fs.mkdirSync(__dirname + 'testDb');
			}
			fs.writeFile(__dirname + `/compose-config/compose-${projectId}.yml`, data, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve('');
				}
			})
		})
	}
	downloadImage() {
		// check node image
		return this.docker.run('docker images').then((result) => {
			const list = result.split('\n');
			const haveServiceImageFlag = false;
			const haveDbImageFlag = false;
			const imageConfig = this.opts.image;
			list.shift();

			list.forEach((image) => {
				const tmp  = _.filter(image.split(' '), (item) => item.length > 1);
				if (tmp.length > 0) {
					// check service image
					//if (tmp[0] === '')
					const imageVersion = `${tmp[0]}:${tmp[1]}`;
					if (imageVersion === this.opts.image.service) {
						haveServiceImageFlag = true;
					}
					if (imageVersion === this.opts.image.db) {
						haveDbImageFlag = true;
					}
				}
			})

			const p = [];
			console.log('begin to download service and db image');
			if (!haveServiceImageFlag) {
				p.push(this.docker.run(`docker pull ${imageConfig.repository}${imageConfig.service}`));
			}
			if (!haveDbImageFlag) {
				p.push(this.docker.run(`docker pull ${imageConfig.repository}${imageConfig.db}`));
			}
			return Promise.all(p);
		})
	}
	stop(projectId) {
		// stop servcie
		return new Promise((resolve, reject) => {
			return this.docker.run(`docker stop ${projectId}_service`).then(() => {
				console.log('stop service container finish')
				// stop db
				return this.docker.run(`docker stop ${projectId}_db`)
			}).then(() => {
				console.log('stop db container finish')
				resolve({
					ack: 'SUCCESS'
				})
			}).catch((err) => {
				reject({
					ack: 'ERROR',
					msg: err.message
				})
			})
		})
	}
	start(projectId) {
		// stop servcie
		return new Promise((resolve, reject) => {
			return this.docker.run(`docker start ${projectId}_service`).then(() => {
				console.log('start service container finish')
				// stop db
				return this.docker.run(`docker start ${projectId}_db`)
			}).then(() => {
				console.log('start db container finish')
				resolve({
					ack: 'SUCCESS'
				})
			}).catch((err) => {
				reject({
					ack: 'ERROR',
					msg: err.message
				})
			})
		})
	}
	create(projectId) {
		const projectInfo = this.testProjectConfig[projectId];
		const servicePort = projectInfo.service.port;
		const dbPort = projectInfo.db.port;
		const imageConfig = this.opts.image

		this.template.services[projectInfo.service.name] = {
			tty: this.opts.openTTY,
			image: imageConfig.repository + imageConfig.service,
			ports: [`${servicePort}:3000`],
			volumes: [`${projectInfo.service.path}:/var/www`],
			command: projectInfo.service.command
		}
		this.template.services[projectInfo.db.name] = {
			tty: this.opts.openTTY,
			image: imageConfig.repository + imageConfig.db,
			ports: [`${dbPort}:27017`],
			volumes: [`${projectInfo.db.path}:/data`],
			command: projectInfo.db.command
		}
		const composeData = j2y.stringify(this.template);
		return this.downloadImage().then(() => {
			// write to file
			return this.writeConfig(projectId, composeData).then(() => {
				return this.docker.run(`docker-compose -p p_${projectId} -f ${__dirname}/compose-config/compose-${projectId}.yml up -d`);
			})
		})
	}
}

const composeController = new ComposeController({
	image: {
		repository:'daocloud.io/',
		service: 'node:7.7.4',
		db: 'mongo:3.2.0'
	}
});
composeController.create('12de3151').then((result) => {
	console.log(result)
}).catch((err) => {
	console.log(err);
});
