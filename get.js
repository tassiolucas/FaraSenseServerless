'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.get = (event, context, callback) => {

  const params = {
    TableName: process.env.CURRENT_SENSOR_TABLE_MIN,
    KeyConditionExpression: 'id = :ident and #timestamp between :start and :end',
    ExpressionAttributeValues: {
      ':ident': Number(event.pathParameters.id),
      ':start': new Date(Number(event.pathParameters.start)).toISOString(),
      ':end': new Date(Number(event.pathParameters.end)).toISOString()
    },
    ExpressionAttributeNames: {
      "#timestamp": "timestamp"
    }
  };

  // fetch todo from the database
  dynamoDb.query(params, (error, result) => {
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
      body: JSON.stringify(result.Items),
    };
    callback(null, response);
  });

};

module.exports.get_hour = (event, context, callback) => {

  const params = {
    TableName: process.env.CURRENT_SENSOR_TABLE_HOUR,
    KeyConditionExpression: 'id = :ident and #timestamp between :start and :end',
    ExpressionAttributeValues: {
      ':ident': Number(event.pathParameters.id),
      ':start': new Date(Number(event.pathParameters.start)).toISOString(),
      ':end': new Date(Number(event.pathParameters.end)).toISOString()
    },
    ExpressionAttributeNames: {
      "#timestamp": "timestamp"
    }
  };

  // fetch todo from the database
  dynamoDb.query(params, (error, result) => {
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
      body: JSON.stringify(result.Items),
    };
    callback(null, response);
  });

};

module.exports.get_day = (event, context, callback) => {

  const params = {
    TableName: process.env.CURRENT_SENSOR_TABLE_HOUR,
    KeyConditionExpression: 'id = :ident and #timestamp between :start and :end',
    ExpressionAttributeValues: {
      ':ident': Number(event.pathParameters.id),
      ':start': new Date(Number(event.pathParameters.start)).toISOString(),
      ':end': new Date(Number(event.pathParameters.end)).toISOString()
    },
    ExpressionAttributeNames: {
      "#timestamp": "timestamp"
    }
  };

  // fetch todo from the database
  dynamoDb.query(params, (error, result) => {
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
      body: JSON.stringify(result.Items),
    };
    callback(null, response);
  });

};
