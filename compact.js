'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const moment = require('moment');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const faraSenseDbMin = process.env.CURRENT_SENSOR_TABLE_MIN;
const faraSenseDbHour = process.env.CURRENT_SENSOR_TABLE_HOUR;
const faraSenseDbDay = process.env.CURRENT_SENSOR_TABLE_DAY;

const faraSenseSensorId = 1;
const kilo = 1000;

var startPeriod;
var endPeriod;

module.exports.minuteToHour = async (event, context, callback) => {

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
        // console.log('Tp: ', totalPower, ' I: ', dataTableHour.Items[i]);
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
            timestamp: firstMoment.toISOString(),
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

module.exports.hourToDay = async (event, context, callback) => {

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

    if (len > 0) {

      var total_kwh = 0;
      var total_power = 0;
    
      console.log('Dia início:', startPeriod.toString(), ' Dia fim:', endPeriod.toString());
      
      var i = 0;
      for (i = 0; i < len; i++) {
        total_kwh = total_kwh + dataTableHour.Items[i].kwh;
        total_power = total_power + dataTableHour.Items[i].media_power;
        // console.log('Tk: ', totalKwh, ' I: ', dataTableHour.Items[i]);
      }
      
      var firstMoment = moment(dataTableHour.Items[0].timestamp);
      var lastMoment = moment(dataTableHour.Items[len - 1].timestamp);
      var duration = moment.duration(lastMoment.diff(firstMoment));
      var interval = duration.asHours();
      
      console.log('Total Kwh: ', total_kwh, ' Total Power: ', total_power,  " FirstMoment: ", firstMoment.format(), " LastMoment: ", lastMoment.format(), " Intervalo: ", interval);
      
      const params2 = {
          TableName: faraSenseDbDay,
          Item: {
            id: faraSenseSensorId,
            timestamp: firstMoment.toISOString(),
            total_kwh: Number(total_kwh),
            total_power: Number(total_power)
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
