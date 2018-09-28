'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.create = (event, context, callback) => {
  const body = JSON.parse(event.body);

  const params = {
    TableName: process.env.CURRENT_SENSOR_TABLE,
    Item: {
      id: body.id,
      timestamp: new Date(body.timestamp).toISOString(),
      amper: Number(body.amper),
      milliamper: Number(body.milliamper),
      power: Number(body.power)
    }
  };

  // write the todo to the database
  dynamoDb.put(params, (error) => {
    // handle potential errors
    if (error) {
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: error.message,
      });
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    };
    callback(null, response);
  });
};
