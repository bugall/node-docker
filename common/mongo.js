const mongoose = require('mongoose');
const db = mongoose.createConnection('mongodb://localhost:27017/docker');
db.on('error', function(err){
	console.log(err);
});
const schema = new mongoose.Schema({ 
    project: String,
    container: String,
    port: Number
});
const container = db.model('container', schema, 'container');

exports.db = db;
exports.container = container;