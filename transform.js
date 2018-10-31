'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const moment = require('moment');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const faraSenseDbMin = process.env.CURRENT_SENSOR_TABLE_MIN;
const faraSenseDbHour = process.env.CURRENT_SENSOR_TABLE_HOUR;
const faraSenseSensorId = 1;
const kilo = 1000;

var startPeriod;
var endPeriod;

module.exports.transformMinToHour = async (event, context, callback) => {

  try {
    startPeriod = new Date();
    endPeriod = new Date();
    
    startPeriod.setHours(startPeriod.getHours() - 1);
    endPeriod.setHours(endPeriod.getHours() - 1);
    
    startPeriod.setMinutes(0, 0, 0);
    endPeriod.setMinutes(59, 59, 999);
    
    const params = {
      TableName: faraSenseDbMin,
      KeyConditionExpression: 'id = :ident and #timestamp between :start and :end',
      ExpressionAttributeValues: {
        ':ident': faraSenseSensorId,
        ':start': startPeriod.toISOString(),
        ':end': endPeriod.toISOString()
      },
      ExpressionAttributeNames: {
        "#timestamp": "timestamp"
      }
    };
    
    const dataTableMin = await dynamoDb.query(params).promise();       
    var len = dataTableMin.Items.length;

    if (len > 0) {

      var totalPower = 0;
    
      console.log('Hora início:', startPeriod.toString(), ' Hora fim:', endPeriod.toString());
      
      var i = 0;
      for (i = 0; i < len; i++) {
        totalPower = totalPower + dataTableMin.Items[i].power;
        i++;
      }
      var mediaPower = (totalPower / len);
  
      var firstMoment = moment(dataTableMin.Items[0].timestamp);
      var lastMoment = moment(dataTableMin.Items[len - 1].timestamp);
      var duration = moment.duration(lastMoment.diff(firstMoment));
      var hour = duration.asHours();
  
      var wattsHour = mediaPower * hour;

      var kilowattsHour = wattsHour / kilo;
      
      console.log('Total Power: ', totalPower, ' Count: ', i, " FirstMoment: ", firstMoment.format(), " LastMoment: ", lastMoment.format(), " Hour: ", hour, " KiloWattsHour:" , kilowattsHour);
      
      const params2 = {
          TableName: faraSenseDbHour,
          Item: {
            id: faraSenseSensorId,
            timestamp: firstMoment.toString(),
            media_power: Number(mediaPower),
            time: Number(hour),
            kwh: Number(kilowattsHour)
            }
          };
      
      const dataTableHour = await dynamoDb.put(params2).promise();

      const response = {
        statusCode: 200,
        body: JSON.stringify(params2.Items),
      };

      callback(null, response);
    } else {
      const response = {
        statusCode: 200,
        body: "Empty hour: " + JSON.stringify(len),
      };
      callback(null, response);
    }      
  } catch (error) {
    const response = {
      statusCode: 500,
      error: `Could not fetch: ${error.stack}`
    };
    
    callback(null, response);
  }
};
