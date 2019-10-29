var express = require('express');
var filtering = require('../trajectory/filtering');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  return res.send('Trajectory API');
});

/* POST trajectory routes */ 
router.post('/mean', function (req, res) {

  // Handle the request
  var json = req.body; // No need for parsing. Is already in json because of express middleware body-parser express.json() in app.js
  
  // Apply the filtering
  var geoJSON = filtering.filter(json.csv_data, json.interval, "mean");

  // Return the GeoJSON object
  return res.json(geoJSON);
});

router.post('/median', function (req, res) {
  // Handle the request
  var json = req.body; // No need for parsing. Is already in json because of express middleware body-parser express.json() in app.js
  
  // Apply the filtering
  var geoJSON = filtering.filter(json.csv_data, json.interval, "median");

  // Return the GeoJSON object
  return res.json(geoJSON);
});

module.exports = router;
