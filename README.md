panoramit
=========

This module requires that Hugin is installed and available via the command line, you may install it from here: http://sourceforge.net/projects/hugin/files/

If you wish to convert your output image to a non-tif file, please install graphicsmagick and make sure that `convert` is available on the command line.

Usage:

```javascript
var panoramit = require('panoramit');

panoramit.generate({
  inputDir: path.join(__dirname, 'input'),
  inputExt: 'jpg',
  outputFile: path.join(__dirname, 'out', 'out.jpg'),
  tempDir: path.join(__dirname, 'tmp'),

  debug: false // optional value in case you want to debug the individual panorama commands
}, function (err, outputPath) {
  // output path is passed through for convenience on success
});

```
