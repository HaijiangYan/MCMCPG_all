const express = require('express'); // import express module
const body_parse = require('body-parser');

require('dotenv').config();
const Dropbox = require('dropbox').Dropbox;
const fetch = require('node-fetch');

const dbx = new Dropbox({
    accessToken: process.env.DROPBOXACCESSTOKEN,
    fetch
})


// function that save data to dropbox
const saveDropbox = function(content, filename) {
    dbx.filesUpload({
        path: '/' + filename, 
        contents: content
    }).then(function(){
        console.log('Completed!');
    }).catch(function(error){
        console.error(error);
    })
};


// the function that converts json file to csv file
function json2csv(objArray){
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var line = '';
    var result = '';
    var columns = [];

    var i = 0;
    for (var j = 0; j < array.length; j++) {
        for (var key in array[j]) {
            var keyString = key + "";
            keyString = '"' + keyString.replace(/"/g, '""') + '",';
            if (!columns.includes(key)) {
                columns[i] = key;
                line += keyString;
                i++;
            }
        }
    }

    line = line.slice(0, -1);
    result += line + '\r\n';

    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var j = 0; j < columns.length; j++) {
            var value = (typeof array[i][columns[j]] === 'undefined') ? '' : array[i][columns[j]];
            var valueString = value + "";
            line += '"' + valueString.replace(/"/g, '""') + '",';
        }

        line = line.slice(0, -1);
        result += line + '\r\n';
    }

    return result;

};


function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let ct = 0;
    while (ct < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      ct += 1;
    }
    return result;
}




// Instantiate the app
var app = express(); 
app.use(express.static(__dirname)); // tell Express where it can find our static files (css images etc)
app.use('/jspsych', express.static(__dirname+'/jspsych')); // tell Express that there is another static files in jspsych folder
app.use(body_parse.json()); // use body parsing middleware


app.set('views', __dirname); // tell Express where our experiment.html is

app.engine('html',require('ejs').renderFile); // tell Express to utilize EJS template engine
app.set('view engine', 'html');

// Routing, second argument specifies the callback function
var exp_info = '';
app.get('/', function(request, response){
    exp_info = request.query;
    // console.log('experiment info:')
    // console.log(exp_info)
    response.render('experiment.html');
})




const {happy_content, neutral_content, sad_content} = require('./all_stimuli.js');
// var counter = {};
// const max_repeat_trial = 3; // max number of participants per trial

// send trial information from server to client
app.get('/happy', function(request, response){  
    // let max_num_unique_trial = 220; // number of unique trials presented to participants (not counting catch trials)
    // only the subset that has not been sufficiently tested will be sent
    // let subset = all_trial_content;
    console.log(happy_content, happy_content.length)
    response.json(happy_content);
})
app.get('/sad', function(request, response){  
    // let max_num_unique_trial = 220; // number of unique trials presented to participants (not counting catch trials)
    // only the subset that has not been sufficiently tested will be sent
    // let subset = all_trial_content;
    console.log(sad_content, sad_content.length)
    response.json(sad_content);
})
app.get('/neutral', function(request, response){  
    // let max_num_unique_trial = 220; // number of unique trials presented to participants (not counting catch trials)
    // only the subset that has not been sufficiently tested will be sent
    // let subset = all_trial_content;
    console.log(neutral_content, neutral_content.length)
    response.json(neutral_content);
})



// obtain experimental data from client to server
app.post('/experiment-data', function(request, response){
    post_data = request.body;
    let data = post_data.experiment_data;
    let part_id = post_data.participant_id || makeid(10);
    // console.log('checking client-side data:', data);
    // console.log('completed trial indices:', trial_idx);
    // convert json to csv
    DATA_CSV = json2csv(data);
    let exp_name = 'rating';
    let filename = exp_name + '-' + part_id + '-' + makeid(6);
    saveDropbox(DATA_CSV, filename+".csv");
    // saveDropbox(JSON.stringify(data), filename+".json");
    // console.log('trial counter info:', counter)
    response.end();
})


// Start the server
var server = app.listen(process.env.PORT || 3000, function(){
    console.log('listening to port %d', server.address().port)
})