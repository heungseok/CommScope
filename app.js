/**
 * Created by heungseok2 on 2017-02-07.
 */
/**
 * Created by heungseok2 on 2017-01-20.
 */
var express = require('express');
var app = express();
var http = require('http').Server(app);
// var world = require('./js/server_world');

app.use('/js', express.static(__dirname + '/js'));
app.use('/lib', express.static(__dirname + '/lib'));
app.use('/img', express.static(__dirname + '/img'));
app.use('/data', express.static(__dirname + '/data'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/js/bundle.js', function (req, res) {
    res.sendFile(__dirname + '/js/bundle.js');
});

app.get('/data/test2.json', function (req, res) {
    res.sendFile(__dirname + '/data/test2.json');
});

app.get('/data/line_chart_data.csv', function (req, res) {
    res.sendFile(__dirname + '/data/line_chart_data.csv');
});


app.get('/data/data.csv', function (req, res) {
    res.sendFile(__dirname + '/data/data.csv');
});
app.get('/data/data-alt.csv', function (req, res) {
    res.sendFile(__dirname + '/data/data-alt.csv');
});



http.listen(3000, function(){
    console.log("Server Running and Listen to port 3000");
});