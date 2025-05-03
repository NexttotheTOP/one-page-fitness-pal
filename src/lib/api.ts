import { type FitnessProfileData } from '@/components/profile/FitnessProfileForm';

interface FitnessProfileRequest {
  user_id: string;
  thread_id: string;
  age: number;
  gender: string;
  height: string;
  weight: string;
  activity_level: string;
  fitness_goals: string[];
  dietary_preferences: string[];
  health_restrictions: string[];
  imagePaths?: {
    front: string[];
    side: string[];
    back: string[];
  };
}

interface AnalyzeBodyCompositionRequest {
  userId: string;
  profileId: string;
  profileData: FitnessProfileData; // Re-use the existing interface
  imagePaths: {
    front: string[];
    side: string[];
    back: string[];
  };
}

export async function generateProfileOverview(
  data: FitnessProfileRequest,
  onMarkdownUpdate: (markdown: string) => void
): Promise<void> {
  try {
    console.log('Sending data to /fitness/profile:', JSON.stringify(data, null, 2));
    const response = await fetch('http://localhost:8000/fitness/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Wait for the complete response
    const responseData = await response.json();

    // Use the content directly from the backend without cleaning
    const markdown = responseData.content || '';
    
    // Call the callback with the raw markdown from the backend
    onMarkdownUpdate(markdown);

  } catch (error) {
    console.error('Error generating profile overview:', error);
    onMarkdownUpdate('**Error: Failed to generate profile**');
    throw error;
  }
}

export async function queryFitnessCoach(
  threadId: string,
  query: string,
  onMarkdownUpdate: (markdown: string) => void
): Promise<void> {
  let accumulatedMarkdown = '';

  try {
    const response = await fetch('http://localhost:8000/fitness/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ thread_id: threadId, query })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Decode the chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE messages
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const content = line.slice(6); // Remove 'data: ' prefix
          
          // Check for completion message
          if (content === '[DONE]') {
            return;
          }

          // Add the content directly (no JSON parsing)
          accumulatedMarkdown += content;
          onMarkdownUpdate(accumulatedMarkdown);
        }
      }
    }

  } catch (error) {
    console.error('Error setting up query:', error);
    onMarkdownUpdate('**Error: Failed to start query**');
    throw error;
  }
}

export async function queryRagSystem(
  query: string,
  onAnswerUpdate: (text: string) => void,
  onStepUpdate?: (step: string) => void,
  onSourceUpdate?: (source: any) => void,
  onError?: (error: string) => void
): Promise<void> {
  let accumulatedAnswer = '';

  try {
    const response = await fetch('http://localhost:8000/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question: query })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Decode the chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE messages
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const content = line.slice(6); // Remove 'data: ' prefix
          
          // Check for completion message
          if (content === '[DONE]') {
            return;
          }

          try {
            // Parse the JSON content
            const jsonContent = JSON.parse(content);
            
            // Handle different message types
            if (jsonContent.type) {
              switch (jsonContent.type) {
                case 'step':
                  if (onStepUpdate) onStepUpdate(jsonContent.content);
                  break;
                  
                case 'source':
                  if (onSourceUpdate) onSourceUpdate(jsonContent.content);
                  break;
                  
                case 'answer':
                  accumulatedAnswer += jsonContent.content;
                  onAnswerUpdate(accumulatedAnswer);
                  break;
                  
                case 'sources_summary':
                  // We may handle the complete sources summary if needed
                  break;
                  
                case 'error':
                  if (onError) onError(jsonContent.content);
                  break;
                  
                default:
                  // For backward compatibility
                  if (typeof jsonContent.content === 'string') {
                    accumulatedAnswer += jsonContent.content;
                    onAnswerUpdate(accumulatedAnswer);
                  }
              }
            } else {
              // For backward compatibility with old format
              if (jsonContent.content) {
                accumulatedAnswer += jsonContent.content;
                onAnswerUpdate(accumulatedAnswer);
              } else {
                // Directly use content if it's a string
                accumulatedAnswer += content;
                onAnswerUpdate(accumulatedAnswer);
              }
            }
          } catch (e) {
            // If JSON parsing fails, just add the content directly
            console.error('Error parsing SSE message:', e);
            accumulatedAnswer += content;
            onAnswerUpdate(accumulatedAnswer);
          }
        }
      }
    }

  } catch (error) {
    console.error('Error querying RAG system:', error);
    if (onError) {
      onError(error instanceof Error ? error.message : String(error));
    } else {
      onAnswerUpdate('**Error: Failed to query the knowledge base**');
    }
    throw error;
  }
}

export async function analyzeBodyComposition(
  data: AnalyzeBodyCompositionRequest
): Promise<string> {
  // Log the data being sent to the backend for debugging
  console.log('Sending data to /fitness/analyze-body-composition:', JSON.stringify(data, null, 2));

  try {
    const response = await fetch('http://localhost:8000/fitness/analyze-body-composition', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
    }

    const responseData = await response.json();
    return responseData.analysis || 'No analysis content received.'; // Adjust based on backend response

  } catch (error) {
    console.error('Error analyzing body composition:', error);
    throw error; // Rethrow the error to be caught in the component
  }
} 