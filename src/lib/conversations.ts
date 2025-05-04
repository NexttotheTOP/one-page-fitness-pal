import { supabase } from './supabase';

// Type definitions (can be moved to a types file later)
export type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: any[];
  steps?: string[];
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
};

// Load conversations for a user
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  // 1. Get all conversations for this user
  const { data: conversationsData, error: conversationsError } = await supabase
    .from('knowledge_conversations')
    .select('id, title, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (conversationsError) throw conversationsError;
  if (!conversationsData) return [];

  // 2. For each conversation, get its messages
  const conversations = await Promise.all(
    conversationsData.map(async (conv) => {
      const { data: messagesData, error: messagesError } = await supabase
        .from('knowledge_messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('timestamp', { ascending: true });

      if (messagesError) throw messagesError;

      // Transform messages to the expected format
      const messages = messagesData?.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        sources: msg.sources || [],
        steps: msg.steps || []
      })) || [];

      // Return the conversation in the expected format
      return {
        id: conv.id,
        title: conv.title,
        messages,
        createdAt: new Date(conv.created_at),
        updatedAt: new Date(conv.updated_at)
      };
    })
  );

  return conversations;
}

// Create a new conversation with a specific ID
export async function createConversation(userId: string, conversation: Conversation): Promise<Conversation> {
  console.log('createConversation called with:', {
    userId,
    conversationId: conversation.id,
    title: conversation.title
  });
  
  // 1. Insert the conversation with the specified ID
  const { data: convData, error: convError } = await supabase
    .from('knowledge_conversations')
    .insert({
      id: conversation.id, // Use the frontend-generated ID
      user_id: userId,
      title: conversation.title,
      created_at: conversation.createdAt.toISOString(),
      updated_at: conversation.updatedAt.toISOString()
    })
    .select()
    .single();

  if (convError) {
    console.error('Error in createConversation:', convError);
    throw convError;
  }
  
  if (!convData) {
    console.error('No data returned from createConversation');
    throw new Error('Failed to create conversation');
  }
  
  console.log('Conversation created successfully:', convData.id);

  // 2. Insert the messages if there are any
  if (conversation.messages && conversation.messages.length > 0) {
    console.log(`Inserting ${conversation.messages.length} messages for conversation ${conversation.id}`);
    
    const messagesForInsert = conversation.messages.map(msg => ({
      conversation_id: conversation.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp.toISOString(),
      sources: msg.sources || [],
      steps: msg.steps || []
    }));

    const { error: msgError } = await supabase
      .from('knowledge_messages')
      .insert(messagesForInsert);

    if (msgError) {
      console.error('Error inserting messages:', msgError);
      throw msgError;
    }
    
    console.log(`Successfully inserted ${conversation.messages.length} messages`);
  } else {
    console.log('No messages to insert for new conversation');
  }

  // 3. Return the original conversation object
  return conversation;
}

// Add a message to a conversation
export async function addMessageToConversation(conversationId: string, message: Message): Promise<void> {
  console.log('addMessageToConversation called:', {
    conversationId,
    role: message.role,
    contentLength: message.content.length,
    hasContent: message.content.length > 0,
    sourcesCount: message.sources?.length || 0,
    stepsCount: message.steps?.length || 0
  });
  
  try {
    // 1. Insert the message
    const { data, error: msgError } = await supabase
      .from('knowledge_messages')
      .insert({
        conversation_id: conversationId,
        role: message.role,
        content: message.content,
        timestamp: message.timestamp.toISOString(),
        sources: message.sources || [],
        steps: message.steps || []
      })
      .select();

    if (msgError) {
      console.error('Error inserting message:', msgError);
      throw msgError;
    }
    
    console.log('Message inserted successfully:', data);

    // 2. Update the conversation's updated_at timestamp
    const { error: updateError } = await supabase
      .from('knowledge_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    if (updateError) {
      console.error('Error updating conversation timestamp:', updateError);
      throw updateError;
    }
    
    console.log('Conversation timestamp updated successfully');
  } catch (error) {
    console.error('Error in addMessageToConversation:', error);
    throw error;
  }
}

// Update a message in a conversation
export async function updateMessage(
  conversationId: string, 
  message: Message,
  messageId?: string
): Promise<void> {
  console.log('updateMessage called with:', { 
    conversationId, 
    messageLength: message.content.length,
    sourcesCount: message.sources?.length || 0
  });

  try {
    // If no message ID is provided, try to find it
    let id = messageId;
    if (!id) {
      id = await getMessageId(conversationId, message.timestamp);
      console.log('Found message ID:', id);
      
      if (!id) {
        console.log('No message ID found, inserting as new message');
        await addMessageToConversation(conversationId, message);
        return;
      }
    }

    const updateData = {
      content: message.content,
      sources: message.sources || [],
      steps: message.steps || []
    };
    
    console.log('Updating message with data:', {
      id,
      contentLength: updateData.content.length,
      sourcesCount: updateData.sources.length,
      stepsCount: updateData.steps.length
    });

    const { error } = await supabase
      .from('knowledge_messages')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Supabase error updating message:', error);
      throw error;
    } else {
      console.log('Message updated successfully in Supabase');
    }
  } catch (error) {
    console.error('Error in updateMessage:', error);
    throw error;
  }
}

// Delete a conversation
export async function deleteConversation(conversationId: string): Promise<void> {
  // Due to cascade delete, we only need to delete the conversation
  const { error } = await supabase
    .from('knowledge_conversations')
    .delete()
    .eq('id', conversationId);

  if (error) throw error;
}

// In conversations.ts, add this function
export async function getMessageId(conversationId: string, timestamp: Date): Promise<string | null> {
  const { data, error } = await supabase
    .from('knowledge_messages')
    .select('id')
    .eq('conversation_id', conversationId)
    .eq('timestamp', timestamp.toISOString())
    .single();
  
  if (error) return null;
  return data?.id || null;
}