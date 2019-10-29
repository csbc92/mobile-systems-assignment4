var csv2json = require('csvjson-csv2json');

function createGeoJSONObject(coordinates) {
    // Create a GeoJSON object accordingly to RFC 7946
    var geoJSON = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": coordinates
            },
            "properties": {
                "description": "Meaningful description"
            }
        }]
    }

    return geoJSON;
}

/*
 * @input csvData - CSV data which seperated by a comma. The columns should be named long and lat respectively.
 * @returns - an array of coordinate pairs (longitude, latitude) as defined in RFC 7946
 */
function parseCSV(csvData) {
    // Parse CSV string into JSON
    const json = csv2json(csvData, { parseNumbers: true });

    var coordinates = {};

    // Extract the phone coordinates to an array of (Longitute, Latitute) as defined in RFC 7946
    coordinates = json.map(o => new Array(o.long, o.lat));

    return coordinates;
}

/**
 * Returns a GeoJSON object given the csv data, interval and method of either mean or median
 * @param {CSV_data to be transformed into GeoJSON} csv_trajectory 
 * @param {The interval that the filter should apply} interval 
 * @param {Either mean or median} method
 */
function filter(csv_trajectory, interval, method) {

    var coordinates = parseCSV(csv_trajectory); // One of the following; csv_biking, csv_driving, csv_running, csv_walking

    if (method === "mean") {
        // Extract x coordinates in a flat array and apply averages on these coordinates
        var x_coordinates_mean = moving_average(coordinates.map((x) => { return x[0] }), interval);
        // Extract y coordinates in a flat array and apply averages on these coordinates
        var y_coordinates_mean = moving_average(coordinates.map((x) => { return x[1] }), interval);
        // Merge the coordinates back into its original data format
        var merged = new Array();
        x_coordinates_mean.forEach((x, i) => merged[i] = [x, y_coordinates_mean[i]]);

        coordinates = merged;
    } else if (method === "median") {
        // Extract x coordinates in a flat array and apply averages on these coordinates
        var x_coordinates_median = moving_median(coordinates.map((x) => { return x[0] }), interval);
        // Extract y coordinates in a flat array and apply averages on these coordinates
        var y_coordinates_median = moving_median(coordinates.map((x) => { return x[1] }), interval);
        // Merge the coordinates back into its original data format
        var merged = new Array();
        x_coordinates_median.forEach((x, i) => merged[i] = [x, y_coordinates_median[i]]);

        coordinates = merged;

    }

    var geoJSON = createGeoJSONObject(coordinates);

    return geoJSON;
}

/*
 * Calculates the moving average of the given coordinates
 * @input coordinates - 1 dimensional coordinate set e.g. {56.145383333333335, 56.153684444444435, ..}
 * @interval - the amount of samples used to calculate the moving average
 * @link - https://en.wikipedia.org/wiki/Moving_average#Simple_moving_average
 * @returns - an array of the calculated moving average
 */
function moving_average(coordinates, interval) {
    // var a = new Array(56.1718867332,56.1718521159,56.1718295686,56.1718200132,56.1718125533,56.17180392,56.1717983879,56.1717957057,56.1717935264,56.1717911795,56.1717895031,56.1717885811,56.1719800237,56.1719754137,56.1719842985,56.1719863939,56.1719869807,56.1719878189,56.1719957817,56.172008606);
    var average_coordinates = new Array();

    for (i = 0; i < coordinates.length; i++) {
        var start_index = (i - Math.floor((interval / 2)));
        var end_index = (i + Math.ceil((interval / 2)));

        if (start_index < 0 || end_index > (coordinates.length - 1)) { // Out of bounds cases
            continue;
        }

        var average = coordinates.slice(start_index, end_index).reduce(((accumulator, current) => accumulator += current), 0) / interval;
        average_coordinates.push(average);
    }

    return average_coordinates;
}

/*
 * Calculates the moving median of the given coordinates
 * @input coordinates - 1 dimensional coordinate set e.g. {56.145383333333335, 56.153684444444435, ..}
 * @interval - the amount of samples used to calculate the moving median
 * @link - https://en.wikipedia.org/wiki/Moving_average#Moving_median
 * @returns - an array of the calculated moving average
 */
function moving_median(coordinates, interval) {
    var median_coordinates = new Array();

    for (i = 0; i < coordinates.length; i++) {
        var start_index = (i - Math.floor((interval / 2)));
        var end_index = (i + Math.ceil((interval / 2)));

        if (start_index < 0 || end_index > (coordinates.length - 1)) { // Out of bounds cases
            continue;
        }

        // Sort the sub-array
        var sorted_coordinates = coordinates.slice(start_index, end_index).sort();
        // Pick the median
        var middle_value = sorted_coordinates[Math.floor(sorted_coordinates.length / 2)];

        median_coordinates.push(middle_value);
    }

    return median_coordinates;
}

module.exports = {
    filter: filter
}