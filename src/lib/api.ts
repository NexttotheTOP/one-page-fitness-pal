interface FitnessProfileRequest {
  thread_id?: string;
  age: number;
  gender: string;
  height: string;
  weight: string;
  activity_level: string;
  fitness_goals: string[];
  dietary_preferences: string[];
  health_restrictions: string[];
}

export async function generateProfileOverview(
  data: FitnessProfileRequest,
  onMarkdownUpdate: (markdown: string) => void
): Promise<void> {
  try {
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
  onMarkdownUpdate: (markdown: string) => void
): Promise<void> {
  let accumulatedMarkdown = '';

  try {
    const response = await fetch('http://localhost:8000/fitness/rag-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
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
            // Parse the JSON and extract just the content
            const jsonContent = JSON.parse(content);
            if (jsonContent.content) {
              accumulatedMarkdown += jsonContent.content;
              onMarkdownUpdate(accumulatedMarkdown);
            }
          } catch (e) {
            // If JSON parsing fails, just add the content directly
            accumulatedMarkdown += content;
            onMarkdownUpdate(accumulatedMarkdown);
          }
        }
      }
    }

  } catch (error) {
    console.error('Error querying RAG system:', error);
    onMarkdownUpdate('**Error: Failed to query the knowledge base**');
    throw error;
  }
} 