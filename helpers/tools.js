var spawn = require('child-process-promise').spawn;

function execute_script(sentence){
    var promise = spawn('./helpers/write_to_telegram.sh', [sentence]);
    return promise.childProcess;
}


module.exports = {
    execute_script: execute_script
};