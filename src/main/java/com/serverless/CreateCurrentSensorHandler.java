package com.serverless;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.Map;

public class CreateCurrentSensorHandler implements RequestHandler<Map<String, Object>, ApiGatewayResponse> {

    private final Logger LOG = LogManager.getLogger(CreateCurrentSensorHandler.class);

    @Override
    public ApiGatewayResponse handleRequest(Map<String, Object> input, Context context) {








        return null;
    }
}
