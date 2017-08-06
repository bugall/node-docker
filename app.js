const express = require('express')
const bodyParser = require('body-parser');
const project = require('./routes/project');
const logger = require('morgan');
const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

require('./common/mongo').db.on('connected', () => {
    app.use('/project', project);
    app.use(function (req, res, next) {
        const err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    app.use(function (err, req, res, next) {
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.end('error');
    });
    app.listen(3000, function () {
        console.log('Example app listening on port 3000!')
    });

});
