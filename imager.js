var fs = new require('fs'),
    bufferEqual = new require('buffer-equal');

// function convertToHex(str) {
//     var hex = '';
//     for(var i=0;i<str.length;i++) {
//         hex += ''+str.charCodeAt(i).toString(16);
//     }
//     return hex;
// }

function attachFileToImage(pathToImage, pathToHiddenFile, extension, callback){
    var primaryBuffer = fs.readFileSync(pathToImage);

    // Custom EOF
    var endOfFile = [32, 163, 200, 3, 8, 56, 106, 158, 246, 66, 73, 66, 10, 134, 56, 137, 33, 128, 39, 137];
    var endOfFileBuffer = new Buffer(endOfFile);

    // find extension, encode as buffer
    var extArray = [];
    
    for (var i=0; i < extension.length; i++) {
	extArray.push(extension.charCodeAt(i));
    }
    
    var extArrayBuffer = new Buffer(extArray);
    console.log(extArrayBuffer);
    
    var hiddenBuffer = fs.readFileSync(pathToHiddenFile);

    var finalOutput = pathToImage.slice(0, pathToImage.length - 4) + '-attached' + pathToImage.slice(pathToImage.length - 4);

    var newBuffer = Buffer.concat([primaryBuffer, endOfFileBuffer, extArrayBuffer, hiddenBuffer]);

    fs.writeFile(finalOutput, newBuffer, function(err){
        if (err) throw err;
        callback();
    });
}

function detachFileFromImage(pathToFixedFile, callback){
    var dataBuffer = fs.readFileSync(pathToFixedFile);
    var endOfFile = [32, 163, 200, 3, 8, 56, 106, 158, 246, 66, 73, 66, 10, 134, 56, 137, 33, 128, 39, 137];
    var endOfFileBuffer = new Buffer(endOfFile);

    // find extension in custom EOF
    for (var i = 0; i < dataBuffer.length; i++){
        if (bufferEqual(dataBuffer.slice(i, i+20), endOfFileBuffer)){
            var extension = dataBuffer.slice(i+20, i+24).toString();
	    console.log(extension);

	    var finalBuffer = dataBuffer.slice(i+24, dataBuffer.length);
	    console.log(finalBuffer);

	    break;
        }
    }

    fs.writeFile("uploads/extracted_file" + extension + ".dat", finalBuffer, function(err){
        if (err) throw err;
        callback();
    });
}

exports.attachFiles = attachFileToImage;
exports.detachFiles = detachFileFromImage;
