module.exports = {
    setJSONBody: setJSONBody
}

const csv = require('./csv_data');

function setJSONBody(requestParams, context, ee, next) {

    var random_trajectory = csv.getRandomTrajectory();

    var body =
    {
        csv_data: random_trajectory,
        interval: 10
    };

    requestParams.headers = {
        'Content-Type': 'application/json'
    };
    requestParams.body = JSON.stringify(body);

    return next(); // MUST be called for the artillery scenario to continue
}