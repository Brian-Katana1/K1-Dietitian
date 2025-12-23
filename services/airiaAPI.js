const UPLOAD_URL = 'https://prodaus.api.airia.ai/api/upload';
const PIPELINE_URL = 'https://prodaus.api.airia.ai/v2/PipelineExecution/9eeadf84-1394-4f64-9e68-bb262aeb3f3a';

export const analyzeImage = async (imageData, apiKey) => {
  try {
    console.log('Starting image analysis with data:', {
      uri: imageData.uri,
      width: imageData.width,
      height: imageData.height,
      hasBase64: !!imageData.base64,
    });

    // Send base64 image directly to the pipeline
    const pipelineBody = {
      userInput: 'Analyze this food image and provide detailed nutritional information',
      images: [`data:image/jpeg;base64,${imageData.base64}`],
      asyncOutput: false,
    };
    console.log('Sending to pipeline with base64 image');

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
      throw new Error(`Pipeline request failed with status ${pipelineResponse.status}: ${errorText}`);
    }

    const data = await pipelineResponse.json();
    console.log('Pipeline response:', data);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
