/**
 * Created by lundfall on 4/25/16.
 */


var connect = require('connect');
var serveStatic = require('serve-static');
var path = __dirname.split('/').slice(0,-1).join('/') + '/www';
var morgan = require('morgan');
var app = connect();
app.use(morgan());
app.use(serveStatic(path)).listen(3000, "0.0.0.0", function(){
    console.log('Server running on 8080...');
    console.log(`path: ${path}`);
});