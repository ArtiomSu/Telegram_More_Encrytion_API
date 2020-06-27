var express = require('express');
var router = express.Router();
var aes = require('../crypts/aes');
var tools = require('../helpers/tools');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({statusCode: 200});
});

router.post('/encrypt',function(req, res, next) {
  if(req.body.text){
    var cipherText = aes.encrypt_text(req.body.text);
    if(cipherText){
        tools.execute_script(cipherText).stdout.on('data', function (data) {
          if(data.toString() === "done\n"){
            res.statusCode = 200;
            return res.json({statusCode: 200});
          }else{
            res.statusCode = 500;
            return res.json({error: "failed to send data"});
          }
          });
    }else{
      res.statusCode = 500;
      return res.json({error:"failed to encrypt data"})
    }
  }else{
    res.statusCode = 400;
    return res.json({error:"cannot encrypt nothing"})
  }

});

router.post('/decrypt',function(req, res, next) {
  if(req.body.text){
    var plaintext = aes.decrypt_text(req.body.text);
    if(plaintext){
          res.statusCode = 200;
          return res.json({text: plaintext});
        }else{
          res.statusCode = 500;
          return res.json({error: "failed to decrypt data"});
        }

  }else{
    res.statusCode = 400;
    return res.json({error:"cannot decrypt nothing"})
  }

});

module.exports = router;
