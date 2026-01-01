const UPLOAD_URL = 'https://prodaus.api.airia.ai/api/upload';
const PIPELINE_URL = 'https://prodaus.api.airia.ai/v2/PipelineExecution/9eeadf84-1394-4f64-9e68-bb262aeb3f3a';
const DIAGNOSIS_PIPELINE_URL = 'https://prodaus.api.airia.ai/v2/PipelineExecution/cb40b6f8-4655-479b-978a-b9877b74c68b';

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

export const getDiagnosis = async (mealData, userInput, apiKey) => {
  try {
    console.log('Starting diagnosis with:', {
      mealCount: mealData.length,
      userInput,
    });

    // Format meal data for the AI
    const formattedMeals = mealData.map(meal => ({
      name: meal.name,
      portion: meal.portion,
      calories: meal.calories,
      nutrients: meal.nutrients,
      timestamp: meal.timestamp,
    }));

    // Create prompt for diagnosis with explicit JSON format instructions
    const prompt = `You are a professional dietitian analyzing a patient's dietary intake and health concerns.

User's concern: ${userInput}

Recent meal history:
${JSON.stringify(formattedMeals, null, 2)}

Please analyze this dietary data and provide a comprehensive health diagnosis in the following JSON format:

{
  "overall_assessment": "excellent|good|fair|needs_improvement|concerning",
  "analysis_period_days": number,
  "clinical_overview": "Brief clinical summary",
  "positive_findings": [
    {
      "habit": "Positive dietary habit",
      "health_benefit": "Associated health benefit"
    }
  ],
  "deficiencies": [
    {
      "nutrient_or_food_group": "Name",
      "severity": "low|moderate|high",
      "current_avg": number,
      "recommended": number,
      "unit": "g|mg|mcg",
      "clinical_significance": "Why this matters"
    }
  ],
  "clinical_correlations": [
    {
      "symptom_or_goal": "User's concern",
      "dietary_factors": ["factor1", "factor2"],
      "confidence": 0.0-1.0
    }
  ],
  "medical_recommendations": {
    "primary": {
      "intervention": "Main recommendation",
      "clinical_rationale": "Why this is important",
      "specific_guidance": "Actionable steps",
      "expected_timeline": "When to expect improvements"
    },
    "secondary": {
      "intervention": "Secondary recommendation",
      "clinical_rationale": "Supporting rationale"
    }
  },
  "therapeutic_dishes": [
    {
      "dish_name": "Recommended dish",
      "key_nutrients": ["nutrient1", "nutrient2"],
      "therapeutic_benefit": "Health benefit",
      "addresses_deficiency": "Which deficiency this helps"
    }
  ],
  "follow_up_needed": true|false,
  "disclaimer": "This is an AI-generated dietary analysis..."
}

Provide ONLY the JSON response, no additional text.`;

    const pipelineBody = {
      userInput: prompt,
      asyncOutput: false,
      disableToolUse: false,
    };

    console.log('Sending to diagnosis pipeline');

    const pipelineResponse = await fetch(DIAGNOSIS_PIPELINE_URL, {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pipelineBody),
    });

    if (!pipelineResponse.ok) {
      const errorText = await pipelineResponse.text();
      console.error('Diagnosis pipeline error:', errorText);

      let userFriendlyMessage = 'Failed to generate diagnosis. ';
      if (pipelineResponse.status === 401 || pipelineResponse.status === 403) {
        userFriendlyMessage += 'API key is invalid or expired.';
      } else if (pipelineResponse.status >= 500) {
        userFriendlyMessage += 'Server error. Please try again later.';
      } else {
        userFriendlyMessage += `Error ${pipelineResponse.status}`;
      }

      throw new Error(userFriendlyMessage);
    }

    const data = await pipelineResponse.json();
    console.log('Diagnosis response:', JSON.stringify(data, null, 2));

    // Check if result is empty
    if (data.$type === 'string' && (!data.result || data.result.trim() === '')) {
      console.error('Empty diagnosis result received');
      throw new Error('The diagnosis pipeline returned an empty response. Please try again or contact support if the issue persists.');
    }

    // Follow same parsing pattern as analyzeImage
    if (data.$type === 'string' && data.result) {
      // Try to parse the result as JSON to see if it's valid diagnosis data
      try {
        const parsedResult = JSON.parse(data.result);
        // If parsing succeeds, it's likely a valid response
        console.log('Successfully parsed diagnosis from result field');
        return { success: true, data };
      } catch (parseError) {
        // If it's not JSON, it might be plain text diagnosis
        console.log('Result is plain text diagnosis');
        return { success: true, data };
      }
    }

    // Check report for errors (same pattern as analyzeImage)
    if (data.report) {
      const reportKeys = Object.keys(data.report);
      if (reportKeys.length > 0) {
        const firstReport = data.report[reportKeys[0]];
        if (firstReport.success === false) {
          const errorMsg = firstReport.exceptionMessage ||
                          data.result ||
                          'Diagnosis generation failed.';
          console.error('Pipeline step failed:', {
            stepTitle: firstReport.stepTitle,
            exceptionMessage: firstReport.exceptionMessage,
          });
          throw new Error(errorMsg);
        }
      }
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in getDiagnosis:', error);
    return { success: false, error: error.message };
  }
};
