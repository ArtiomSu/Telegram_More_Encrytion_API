var _crypto = require("crypto");

var masterkey =  _crypto.randomBytes(256);
var cypher_texts = [];
var save_cipher_texts = false;

//console.log(_crypto.createHash("sha256").update(masterkey).digest().length);


var config = {
    iv_length: 128,
    salt_length: 256,
    key_length: 32,
    key_itterations: 20000, //doesnt matter how much you change this in terms of ciphertext length
    max_plain_text_legth: 2670
};




/*
iv
2000 text = 3200 cipher with 128, 256, 32, 10000
2000 text = 3204 cipher with 129, 256, 32, 10000
2000 text = 3204 cipher with 130, 256, 32, 10000
2000 text = 3204 cipher with 131, 256, 32, 10000
2000 text = 3208 cipher with 132, 256, 32, 10000
2000 text = 3212 cipher with 135, 256, 32, 10000
salt
2000 text = 3200 cipher with 128, 256, 32, 10000
2000 text = 3204 cipher with 128, 257, 32, 10000
2000 text = 3204 cipher with 128, 258, 32, 10000
2000 text = 3204 cipher with 128, 259, 32, 10000
2000 text = 3208 cipher with 128, 260, 32, 10000


* */

var encrypt = function(text){

    if(text.length < config.max_plain_text_legth){
        text = text + "\0".repeat(config.max_plain_text_legth-text.length);
    }else if(text.length > config.max_plain_text_legth){
        return false; // later on split text into more parts
    }

    // random initialization vector
    const iv = _crypto.randomBytes(config.iv_length);

    // random salt
    const salt = _crypto.randomBytes(config.salt_length);

    // derive encryption key: 32 byte key length
    // in assumption the masterkey is a cryptographic and NOT a password there is no need for
    // a large number of iterations. It may can replaced by HKDF
    // the value of 2145 is randomly chosen!
    const key = _crypto.pbkdf2Sync(masterkey, salt, config.key_itterations, config.key_length, 'sha512');

    // AES 256 GCM Mode
    const cipher = _crypto.createCipheriv('aes-256-gcm', key, iv);

    // encrypt the given text
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);

    // extract the auth tag
    const tag = cipher.getAuthTag();

    //console.log("checking lengths key is ", key.length, " tag is ", tag.length, " encrypted is ", encrypted.length);
    // generate output
    return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
}

function encrypt_text(text) {
    var cipher_text = encrypt(text);
    if(cipher_text){
        if(cipher_text.length > 4096){
            console.log("\n##################################\ntoo big\n#################################\n");
            return false;
        }else{
            if(save_cipher_texts)
                cypher_texts.push(cipher_text);
            return cipher_text;
        }
    }
    return false;
    //console.log("ciphertext is ",cipher_text.length,"\n",cipher_text);

}

var decrypt = function(encdata){
    // base64 decoding
    const bData = Buffer.from(encdata, 'base64');

    // convert data to buffers
    const salt = bData.slice(0, config.salt_length);
    const iv = bData.slice(config.salt_length, config.salt_length+config.iv_length);
    const tag = bData.slice(config.salt_length+config.iv_length, config.salt_length+config.iv_length+16);
    const text = bData.slice(config.salt_length+config.iv_length+16);

    //console.log("all header size = ", config.salt_length+config.iv_length+16, " text length = ", text.length);

    // derive key using; 32 byte key length
    const key = _crypto.pbkdf2Sync(masterkey, salt , config.key_itterations, config.key_length, 'sha512');

    // AES 256 GCM Mode
    const decipher = _crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    var plaintext = "";
    try{
        plaintext = decipher.update(text, 'binary', 'utf8') + decipher.final('utf8');
    }catch (e) {
        plaintext = false;
    }
    return plaintext;
}

function decrypt_text(text){
    return decrypt(text);
}

function decrypt_all_cipher_texts() {
    for(var i = 0; i<cypher_texts.length;i++){
        console.log("\ntrying to decrypt ciphertext ",i," \n",decrypt(cypher_texts[i]));
    }
}

module.exports = {
    decrypt_all_cipher_texts: decrypt_all_cipher_texts,
    decrypt_text: decrypt_text,
    encrypt_text: encrypt_text,
    save_cipher_texts: save_cipher_texts
};