var crypto = require('crypto'),
    fs = require('fs');

var algorithm = 'aes-256-ctr';

function encrypt(filepath, password, callback){
    var dataBuffer = fs.readFileSync(filepath);
    var cipher = crypto.createCipher(algorithm,password);
    var crypted = Buffer.concat([cipher.update(dataBuffer),cipher.final()]);
    fs.writeFile(filepath+".dat", crypted, function (err) {
        if (err) throw err;
        callback();
    });
}

function decrypt(filepath, password, callback){
    var dataBuffer = fs.readFileSync(filepath);
    var decipher = crypto.createDecipher(algorithm,password);
    var decrypted = Buffer.concat([decipher.update(dataBuffer) , decipher.final()]);
    fs.writeFile(filepath.substring(0,filepath.length - 4), decrypted, function (err) {
        if (err) throw err;
        callback();
    });
}

exports.encrypt = encrypt;
exports.decrypt = decrypt;
