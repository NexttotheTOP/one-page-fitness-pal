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

export interface RagMessage {
  type: 'step' | 'source' | 'answer' | 'sources_summary' | 'error';
  content: any;
}

export interface RagCallbacks {
  onAnswerUpdate: (text: string) => void;
  onStepUpdate?: (step: string) => void;
  onSourceUpdate?: (source: any) => void;
  onError?: (error: string) => void;
}

export interface RagQueryOptions {
  userId: string;
  threadId: string;
  query: string;
  callbacks: RagCallbacks;
}

export async function generateProfileOverview(
  data: FitnessProfileRequest,
  onMarkdownUpdate: (markdown: string) => void
): Promise<void> {
  try {
    console.log('Sending data to /fitness/profile:', JSON.stringify(data, null, 2));
    const response = await fetch('http://web-production-aafa6.up.railway.app/fitness/profile', {
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
    const response = await fetch('http://web-production-aafa6.up.railway.app/fitness/query', {
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
  userId: string,
  threadId: string,
  query: string,
  onAnswerUpdate: (text: string) => void,
  onStepUpdate?: (step: string) => void,
  onSourceUpdate?: (source: any) => void,
  onError?: (error: string) => void
): Promise<string> {
  let accumulatedAnswer = '';
  console.log(`queryRagSystem called - userId: ${userId}, threadId: ${threadId}, query length: ${query.length}`);

  try {
    const response = await fetch('http://web-production-aafa6.up.railway.app/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        question: query,
        user_id: userId,
        thread_id: threadId
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      const errorMessage = `HTTP error: ${response.status}`;
      if (onError) onError(errorMessage);
      throw new Error(errorMessage);
    }

    if (!response.body) {
      const errorMessage = "Response has no body";
      if (onError) onError(errorMessage);
      throw new Error(errorMessage);
    }

    // Process the stream
    accumulatedAnswer = await processStream(
      response.body, 
      { onAnswerUpdate, onStepUpdate, onSourceUpdate, onError }
    );

    console.log(`queryRagSystem complete - final answer length: ${accumulatedAnswer.length}`);
    
    // Wait a moment to ensure UI has updated before returning
    await new Promise(resolve => setTimeout(resolve, 100));
    return accumulatedAnswer;

  } catch (error) {
    console.error('Error querying RAG system:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (onError) {
      onError(errorMessage);
    } else {
      onAnswerUpdate('**Error: Failed to query the knowledge base**');
    }
    
    throw error;
  }
}

// Separate the stream processing logic for better code organization
async function processStream(
  stream: ReadableStream<Uint8Array>,
  callbacks: RagCallbacks
): Promise<string> {
  const { onAnswerUpdate, onStepUpdate, onSourceUpdate, onError } = callbacks;
  const reader = stream.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let isDone = false;
  let accumulatedAnswer = '';

  try {
    while (!isDone) {
      const { done, value } = await reader.read();
      if (done) {
        isDone = true;
        console.log('Stream complete - done flag received');
        break;
      }

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
            console.log('Received [DONE] completion marker');
            isDone = true;
            break;
          }

          try {
            // Parse the JSON content
            const jsonContent = JSON.parse(content) as RagMessage;
            
            // Handle different message types
            if (jsonContent.type) {
              switch (jsonContent.type) {
                case 'step':
                  console.log(`Step update: ${jsonContent.content.substring(0, 30)}...`);
                  if (onStepUpdate) onStepUpdate(jsonContent.content);
                  break;
                  
                case 'source':
                  console.log(`Source update: ${jsonContent.content.content.substring(0, 30)}...`);
                  if (onSourceUpdate) onSourceUpdate(jsonContent.content);
                  break;
                  
                case 'answer':
                  console.log(`Answer update, length: ${jsonContent.content.length}`);
                  accumulatedAnswer += jsonContent.content;
                  onAnswerUpdate(accumulatedAnswer);
                  break;
                  
                case 'sources_summary':
                  console.log('Received sources summary');
                  break;
                  
                case 'error':
                  console.error(`Error from backend: ${jsonContent.content}`);
                  if (onError) onError(jsonContent.content);
                  break;
                  
                default:
                  // For backward compatibility
                  if (typeof jsonContent.content === 'string') {
                    console.log(`Default update, length: ${jsonContent.content.length}`);
                    accumulatedAnswer += jsonContent.content;
                    onAnswerUpdate(accumulatedAnswer);
                  }
              }
            } else if (jsonContent.content) {
              // For backward compatibility with old format
              console.log(`Legacy content update, length: ${jsonContent.content.length}`);
              accumulatedAnswer += jsonContent.content;
              onAnswerUpdate(accumulatedAnswer);
            } else {
              // Directly use content if it's a string and nothing else works
              console.log(`Direct string update, length: ${content.length}`);
              accumulatedAnswer += content;
              onAnswerUpdate(accumulatedAnswer);
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

    // Process any remaining buffer content
    if (buffer.length > 0 && buffer.startsWith('data: ')) {
      try {
        const content = buffer.slice(6);
        if (content !== '[DONE]') {
          const jsonContent = JSON.parse(content);
          if (jsonContent.content) {
            accumulatedAnswer += jsonContent.content;
            onAnswerUpdate(accumulatedAnswer);
          }
        }
      } catch (e) {
        console.error('Error parsing final buffer content:', e);
      }
    }

    return accumulatedAnswer;
  } catch (error) {
    console.error('Error processing stream:', error);
    if (onError) onError('Error processing response stream');
    throw error;
  } finally {
    // Make sure we release the reader if there's an error
    try {
      await reader.cancel();
    } catch (e) {
      console.error('Error cancelling reader:', e);
    }
  }
}

export async function analyzeBodyComposition(
  data: AnalyzeBodyCompositionRequest
): Promise<string> {
  // Log the data being sent to the backend for debugging
  console.log('Sending data to /fitness/analyze-body-composition:', JSON.stringify(data, null, 2));

  try {
    const response = await fetch('http://web-production-aafa6.up.railway.app/fitness/analyze-body-composition', {
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