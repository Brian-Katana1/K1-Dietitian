const UPLOAD_URL = 'https://prodaus.api.airia.ai/api/upload';
const PIPELINE_URL = 'https://prodaus.api.airia.ai/v2/PipelineExecution/9eeadf84-1394-4f64-9e68-bb262aeb3f3a';

export const analyzeImage = async (imageData, apiKey) => {
  try {
    console.log('Starting image analysis with data:', {
      uri: imageData.uri,
      width: imageData.width,
      height: imageData.height,
      hasBase64: !!imageData.base64,
      base64Length: imageData.base64?.length,
    });

    if (!imageData.base64) {
      throw new Error('No image data available. Please try taking another photo.');
    }

    // Send base64 image directly to the pipeline
    const pipelineBody = {
      userInput: 'Analyze this food image and provide detailed nutritional information',
      images: [`data:image/jpeg;base64,${imageData.base64}`],
      asyncOutput: false,
      disableToolUse: true, // Disable tools to avoid internal server errors
    };

    console.log('Sending to pipeline. Image size:', Math.round(imageData.base64.length / 1024), 'KB');

    const pipelineResponse = await fetch(PIPELINE_URL, {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pipelineBody),
    });

    if (!pipelineResponse.ok) {
      const errorText = await pipelineResponse.text();
      console.error('Pipeline error response:', errorText);

      let userFriendlyMessage = 'Failed to analyze image. ';
      if (pipelineResponse.status === 400) {
        userFriendlyMessage += 'The image may be too large or in an unsupported format. Try a different image.';
      } else if (pipelineResponse.status === 401 || pipelineResponse.status === 403) {
        userFriendlyMessage += 'API key is invalid or expired. Please check your configuration.';
      } else if (pipelineResponse.status >= 500) {
        userFriendlyMessage += 'Server error. Please try again later.';
      } else {
        userFriendlyMessage += `Error ${pipelineResponse.status}`;
      }

      throw new Error(userFriendlyMessage);
    }

    const data = await pipelineResponse.json();
    console.log('Pipeline response:', JSON.stringify(data, null, 2));

    // Check if there's a top-level error or valid data
    if (data.$type === 'string' && data.result) {
      // Try to parse the result as JSON to see if it's valid food data
      try {
        const parsedResult = JSON.parse(data.result);
        // If it has food data properties, it's a valid response
        if (parsedResult.name || parsedResult.calories || parsedResult.nutrients) {
          console.log('Successfully parsed food data from result field');
          // Return as success - the result field contains the food data as a JSON string
          return { success: true, data };
        }
      } catch (parseError) {
        // If parsing fails, treat it as an error message
        console.error('Pipeline execution error:', data.result);
        throw new Error(`Pipeline error: ${data.result}`);
      }

      // If parsed but doesn't look like food data, treat as error
      console.error('Pipeline execution error:', data.result);
      throw new Error(`Pipeline error: ${data.result}`);
    }

    // Check if the pipeline execution was successful
    if (data.report) {
      const reportKeys = Object.keys(data.report);
      if (reportKeys.length > 0) {
        const firstReport = data.report[reportKeys[0]];
        if (firstReport.success === false) {
          const errorMsg = firstReport.exceptionMessage ||
                          data.result ||
                          'AI analysis failed. The image may not contain recognizable food items.';
          console.error('Pipeline step failed:', {
            stepTitle: firstReport.stepTitle,
            exceptionMessage: firstReport.exceptionMessage,
            completionStatus: firstReport.completionStatus,
          });
          throw new Error(errorMsg);
        }
      }
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in analyzeImage:', error);
    return { success: false, error: error.message };
  }
};
