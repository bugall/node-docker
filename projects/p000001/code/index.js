const mongoose = require('mongoose');
const db = mongoose.createConnection('mongodb://db/test');
db.on('error', function(err){
	console.log(err)
})

const fs = require('fs');
const schema = new mongoose.Schema({ name: String });
const collectionName = 'kittens';
const  M = db.model('Kitten', schema, collectionName);

db.on('connected', function(){
	console.log('connected success');

	const silence = new M({ name: "Silence"});
	M.find({}).then((result) => {
		const print = `Counter: ${result.length}`
		console.log(print);
		fs.appendFile(__dirname + '/result.txt', print);
	})
	silence.save();
})
