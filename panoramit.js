var exec = require('child_process').exec;
var path = require('path');

/**
 * Generates a panorama from a set of input images
 *
 * @param  {{
 *             inputDir: string,
 *             inputExt: string,
 *             outputFile: string,
 *             tempDir: string,
 *             debug: boolean|undefined
 *         }} options
 * @param  {function(Error=, string)} callback node-style callback which
 *     returns the output file path on success
 */
var generatePanorama = function(options, callback) {
  // validate inputs
	var inputDir = options.inputDir;
	if (!inputDir) return callback(new Error('options.inputDir is required'));
	var inputExt = options.inputExt;
	if (!inputExt) return callback(new Error('options.inputExt is required'));
	var outputFile = options.outputFile;
	if (!outputFile) return callback(new Error('options.outputFile is required'));
	var tempDir = options.tempDir;
	if (!tempDir) return callback(new Error('options.tempDir is required'));
  var debug = options.debug || false;

  // set up common paths
	var paths = {
		INPUT_WILDCARD: path.join(inputDir, '*.' + inputExt),
		PTO_FILE: path.join(tempDir, 'project.pto'),
    MK_FILE: path.join(tempDir, 'project.mk'),
    DEFAULT_OUTPUT_FILE: path.join(tempDir, 'prefix.tif'),
    PREFIX_OUTPUT_FILES: path.join(tempDir, 'prefix*.tif')
	};

  // build the base set of commands for panorama generation
	commands = [
		'pto_gen -o ' + paths.PTO_FILE + ' ' + paths.INPUT_WILDCARD,
		'cpfind -o ' + paths.PTO_FILE + ' --multirow --celeste ' + paths.PTO_FILE ,
		'cpclean -o ' + paths.PTO_FILE + ' ' + paths.PTO_FILE ,
		'linefind -o ' + paths.PTO_FILE + ' ' + paths.PTO_FILE ,
		'autooptimiser -a -m -l -s -o ' + paths.PTO_FILE + ' ' + paths.PTO_FILE ,
		'pano_modify --canvas=AUTO --crop=AUTO -o ' + paths.PTO_FILE + ' ' + paths.PTO_FILE ,
		'pto2mk -o ' + paths.MK_FILE + ' -p prefix ' + paths.PTO_FILE ,
		'make -f ' + paths.MK_FILE + ' all'
	];

  var desiredOutputExtension = outputFile.split('.').pop();
  if (desiredOutputExtension.toLowerCase() !== 'tif') {
    // use imagemagick to convert into the desired format
    commands.push('gm convert ' + paths.DEFAULT_OUTPUT_FILE + ' ' + outputFile);
  } else {
    // just move the file
    commands.push('mv ' + paths.DEFAULT_OUTPUT_FILE + ' ' + outputFile);
  }

  /**
   * Cleans up any prefix tifs that are hanging around
   */
  var cleanup = function () {
    process.chdir(tempDir);
    exec('rm ' + paths.PREFIX_OUTPUT_FILES, function() {});
    exec('rm ' + paths.PTO_FILE, function() {});
    exec('rm ' + paths.MK_FILE, function() {});
  }

	var currCommand = 0;

  /**
   * Run the next command in the queue or return on error/success
   */
	var runNextCommand = function () {
		if (currCommand >= commands.length) {
      cleanup();
			return callback(outputFile);
		}

		process.chdir(tempDir);
    if (debug) console.log('running', commands[currCommand]);

    // execute the command and call the next command on success
		exec(commands[currCommand], function(err, data) {
			if (err) {
        console.error("Failed running: " + commands[currCommand]);
        cleanup();
				callback(err);
			} else {
				currCommand++;
				return runNextCommand();
			}
		});
	};
	runNextCommand();
};

module.exports = {
	generate: generatePanorama
};
