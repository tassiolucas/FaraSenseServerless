'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const moment = require('moment');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const faraSenseDbHour = process.env.CURRENT_SENSOR_TABLE_HOUR;
const faraSenseDbDay = process.env.CURRENT_SENSOR_TABLE_DAY;
const faraSenseSensorId = 1;

var startPeriod;
var endPeriod;

module.exports.compactHourToDay = async (event, context, callback) => {

  try {
    startPeriod = new Date();
    endPeriod = new Date();
    
    startPeriod.setDate(startPeriod.getDate() -1);
    endPeriod.setDate(endPeriod.getDate() - 1);
    
    startPeriod.setHours(0, 0, 0, 0);
    endPeriod.setHours(23, 59, 59, 999);

    console.log("Start: ", startPeriod);
    console.log("End: ", endPeriod);
    
    const params = {
      TableName: faraSenseDbHour,
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
    
    const dataTableHour = await dynamoDb.query(params).promise();       
    var len = dataTableHour.Items.length;
    
    console.log("ITENS " , dataTableHour.Items);

    if (len > 0) {

      var totalKwh = 0;
    
      console.log('Dia início:', startPeriod.toString(), ' Dia fim:', endPeriod.toString());
      
      var i = 0;
      for (i = 0; i < len; i++) {
        totalKwh = totalKwh + dataTableHour.Items[i].kwh;
        i++;
      }
      
      var firstMoment = moment(dataTableHour.Items[0].timestamp);
      var lastMoment = moment(dataTableHour.Items[len - 1].timestamp);
      var duration = moment.duration(lastMoment.diff(firstMoment));
      var interval = duration.asHours();
      
      console.log(' Total Kwh: ', totalKwh, " FirstMoment: ", firstMoment.format(), " LastMoment: ", lastMoment.format(), " Intervalo: ", interval);
      
      const params2 = {
          TableName: faraSenseDbDay,
          Item: {
            id: faraSenseSensorId,
            timestamp: startPeriod.toString(),
            totalKwh: Number(totalKwh)
            }
          };
      
      const dataTableDay = await dynamoDb.put(params2).promise();

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
