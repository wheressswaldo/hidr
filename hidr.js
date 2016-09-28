var fs = require('fs'),
    spawn = require('child_process').spawn,
    bufferEqual = require('buffer-equal');

function debug() {
    console.error.apply(console, arguments);
}

/*
 * function(String,Array,Function)
 */

function archive(pathToPDF, hiddenFiles, callback) {
    var finalOutput = pathToPDF.slice(0, pathToPDF.length - 4) + '-attached' + pathToPDF.slice(pathToPDF.length - 4);

    var args = [pathToPDF, 'attach_files',hiddenFiles].concat(['output', finalOutput]);

    var pdftk = spawn('pdftk', args);

    pdftk.on('close', function(code) {
        callback();
    });
};

/*
 * hideFiles takes one argument: pathToPDF (String)
 * returns pathToPDF (in the vein of attachFiles)
 */
function convertToHex(str) {
    var hex = '';
    for(var i=0;i<str.length;i++) {
        hex += ' '+str.charCodeAt(i).toString(16);
    }
    return hex;
}

function hide(pathToPDF, hiddenFile, callback) {
    var tmp = [69, 109, 98, 101, 100, 100, 101, 100, 70, 105, 108, 101, 115];
    var tmpBuffer = new Buffer(tmp);

    var dataBuffer = fs.readFileSync(pathToPDF);

    for (var i = 0; i < dataBuffer.length; i++) {
        if (bufferEqual(dataBuffer.slice(i,i+13), tmpBuffer)) {
            dataBuffer[i] = 101;
            dataBuffer[i+8] = 102;
        }
    }

    var extString = convertToHex(hiddenFile); 
    var extArray = extString.split(' ');
    for (var i = 0; i < extArray.length; i++){
	extArray[i] = parseInt(extArray[i], 16);
    }
    extArray[0] = 1;
  //  console.log(extArray);
    var extArrayBuffer = new Buffer(extArray);

    var finalBuffer = Buffer.concat([dataBuffer, extArrayBuffer]);

    fs.writeFile(pathToPDF, finalBuffer, function(err) {
        if (err) throw err;
        callback();
    });
};

/*
 * showFiles reverses hideFiles, takes one argument pathToPDF (String)
 * returns pathToPDF after modifying the files
 */

function show (pathToPDF, callback) {
    var tmp = [101, 109, 98, 101, 100, 100, 101, 100, 102, 105, 108, 101, 115];
    var tmpBuffer = new Buffer(tmp);

    var dataBuffer = fs.readFileSync(pathToPDF);

    for (var i = 0; i < dataBuffer.length; i++) {
        if (bufferEqual(dataBuffer.slice(i,i+13), tmpBuffer)) {
            dataBuffer[i] = 69;
            dataBuffer[i+8] = 70;
        }
    }

    fs.writeFile(pathToPDF, dataBuffer, function(err) {
        if (err) throw err;
        callback();
    });
}

function retrieve(pathToPDF, callback) {
    var outputDir = "uploads/";
    var args = [pathToPDF, 'unpack_files', 'output', outputDir];

    var pdftk = spawn('pdftk', args);

    pdftk.on('close', function(code) {
	callback();
    });
}

exports.attachFiles = archive;
exports.retrieveFiles = retrieve;
exports.hideFiles = hide;
exports.showFiles = show;
