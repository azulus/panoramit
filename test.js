var panoramit = require('./panoramit');
var path = require('path');

panoramit.generate({
    inputPaths: path.join(__dirname, 'examples', '*.JPG'),
    tempDir: '/tmp',
    outputFile: path.join(__dirname, 'out', 'out.tif'),

    debug: true
}, function (err, data) {
    console.log(arguments);
})
