// Not being used,only if more control over autehtnication etc is needed

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const workoutData = await req.json();

    // Log the complete workout data structure
    console.log('=== Workout Variation Request Data ===');
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      requestData: workoutData
    }, null, 2));
    console.log('=====================================');

    // Call the Langgraph agent at the correct endpoint
    const response = await fetch('https://web-production-aafa6.up.railway.app/workout/variation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(workoutData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Langgraph server error:', errorText);
      throw new Error('Failed to generate workout variation');
    }

    const data = await response.json();
    
    // Log the response data
    console.log('=== Workout Variation Response ===');
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      responseData: data
    }, null, 2));
    console.log('=================================');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in generate-workout-variation:', error);
    return NextResponse.json(
      { error: 'Failed to generate workout variation' },
      { status: 500 }
    );
  }
} 