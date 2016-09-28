var express = require('express');
var fs = require('fs');
var router = express.Router();
var hide = require('../hidr.js');
var encrypt = require('../encryptor.js');
var findRemoveSync = require('find-remove');
var bufferEqual = require('buffer-equal');
var imager = require('../imager.js');

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index');
});

router.get('/about', function(req, res){
    res.render('about');
});

router.get('/documentation', function(req, res){
    res.render('documentation');
});

router.post('/encode', function(req, res, next){
    req.session.baseName = req.files.baseFile.name;
    req.session.hideName = req.files.hideFile.name;
    req.session.basepath = req.files.baseFile.path;
    req.session.hidepath = req.files.hideFile.path;

    var basepath = req.session.basepath,
        encPath = basepath.slice(0, basepath.length - 4) + '-attached' + basepath.slice(basepath.length - 4),
        encName = req.session.baseName.slice(0, req.session.baseName.length - 4) + '-attached' + req.session.baseName.slice(req.session.baseName.length - 4);
    req.session.retPath = encPath;
    req.session.retName = encName;
    
    var extension = basepath.slice(basepath.length - 4);
    var hiddenExtension = req.session.hideName.substr(req.session.hideName.lastIndexOf('.'));

    if (extension !== ".pdf"){
	encrypt.encrypt(req.session.hidepath, req.body.password, function(err) {
            imager.attachFiles(basepath, req.session.hidepath+".dat", hiddenExtension, function(err){
		if (err) throw err;
		res.redirect('/download');
            });
	});
    }
    else{
        encrypt.encrypt(req.session.hidepath, req.body.password, function(err) {
            if (err) throw err;
            hide.attachFiles(basepath, req.session.hidepath+".dat", function(err) {
                if (err) throw err;
                hide.hideFiles(encPath, req.session.hidepath+".dat", function(err) {
                    if (err) throw err;
                    res.redirect('/download');
                });
            });
        });
    }
});

router.get('/download', function(req, res) {
    res.render('download', function(err, html) {
        if (req.session.retPath) {
            res.download(req.session.retPath, req.session.retName, function() {
                var result = findRemoveSync("uploads/", {files: [req.session.retName,
								 req.session.baseName,
								 req.session.hideName,
								 req.session.encodedName],
							 extensions: '.dat'
							});
            });
        }
    });
});

router.post('/decode', function(req, res, next){
    req.session.encodedName = req.files.encodedFile.name;
    req.session.encodedpath = req.files.encodedFile.path;

    var encName = req.session.encodedName,
        encPath = req.session.encodedpath;

    req.session.retName = encName;
    req.session.retPath = encPath;

    var extension = encPath.slice(encPath.length - 4);
    if (extension !== ".pdf"){
	var imageBuffer = fs.readFileSync(encPath);
	var endOfFile = [32, 163, 200, 3, 8, 56, 106, 158, 246, 66, 73, 66, 10, 134, 56, 137, 33, 128, 39, 137];
	var endOfFileBuffer = new Buffer(endOfFile);
	
	for (var i = 0; i < imageBuffer.length; i++){
            if (bufferEqual(imageBuffer.slice(i, i+20), endOfFileBuffer)){
		var hiddenExtension = imageBuffer.slice(i+20, i+24).toString();
	    }
	}

	imager.detachFiles(req.session.retPath, function(err) {
	    if (err) throw err;
	    encrypt.decrypt("uploads/extracted_file" + hiddenExtension + ".dat", req.body.password, function(err) {
		if (err) throw err;
		req.session.retName = "extracted_file" + hiddenExtension;
		req.session.retPath = "uploads/" + req.session.retName;
		res.redirect('/download');
	    });
	});
    }
    else{
	var tempArray = [117, 112, 108, 111, 97, 100, 115];
	var tempArrayBuffer = new Buffer(tempArray);
	
	var dataBuffer = fs.readFileSync(encPath);

	for (var i = dataBuffer.length - 1; i > 0; i--) {
           if (bufferEqual(dataBuffer.slice(i, i+7), tempArrayBuffer)) {
		req.session.retName = dataBuffer.slice(i+8, dataBuffer.length).toString();
		req.session.retPath = "uploads/" + req.session.retName;
            }
	}

	hide.showFiles(encPath, function(err) {
            if (err) throw err;
            hide.retrieveFiles(encPath, function(err) {
		if (err) throw err;
		encrypt.decrypt(req.session.retPath, req.body.password, function(err) {
                    if (err) throw err;
                    req.session.retName = req.session.retName.split(".dat",1);
                    req.session.retPath = "uploads/" + req.session.retName;
                    res.redirect('/download');
		});
            });
	});
    }
});

module.exports = router;
