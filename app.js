var express = require('express');
var app = express();

/**
 * Various vars
 */
var crypto       = require('crypto');
var async        = require('async');
var _json        = require(__dirname + '/lib/escaped-json');
var bodyParser = require('body-parser');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

/**
 * This is the endpoint WC needs to post through a webhook to,
 * when a new sale has been made.
 */
app.post('/print', function (req, res) {
    var webhookBody      = req.body || {};
    var webhookSignature = req.headers['x-wc-webhook-signature'];

    console.log('Receiving webhook...');

    if (!webhookBody || !webhookSignature) {
        console.log('Access denied - invalid request');

        return res.send('access denied', 'invalid request', null, 403);
    }

    var secret    = '3d'
    var data      = _json.stringify(webhookBody);
    var signature = crypto.createHmac('sha256', secret).update(data).digest('base64');

    // Check the webhook signature
    if (webhookSignature !== signature) {
        console.log('Access denied - invalid signature');

        return res.send('access denied', 'invalid signature', null, 403);
    }

    console.log(webhookBody);
    console.log('Webhook received successfully!');

    // Get the order's first item
    var line_items = webhookBody.order.line_items;
    var item1 = line_items[0];

    var itemName = item1.name.replace(/ /g,"_");

    console.log(itemName);

    // Print
    var Client = require('node-rest-client').Client;

    var client = new Client();

    var args = {
        data: {
            "command": "select",
            "print": true
        },
        headers: {
            "X-Api-Key": "<yourapikey>",
            "Content-Type": "application/json"
        }
    }

    client.post("http://192.168.1.103/api/files/local/" + itemName + ".gco", args, function (data, response) {
        console.log(response);
    });

});

/**
 * Home page.
 */
app.get('/', function (req, res) {
    res.send("Bryce is 3d printing all the things!");
});

/**
 * Start the server.
 */
var server = app.listen(80, function () {
  var host = '127.0.0.1';
  var port = '80';

  console.log('Woo 3D Print listening at http://%s:%s', host, port);
});