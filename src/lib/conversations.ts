import { supabase } from './supabase';
import { PostgrestError } from '@supabase/supabase-js';

// Enhanced type definitions with proper documentation
export type MessageRole = 'user' | 'assistant';

export interface MessageSource {
  content: string;
  metadata: {
    source?: string;
    title?: string;
    author?: string;
    [key: string]: any;
  };
}

export interface Message {
  role: MessageRole;
  content: string;
  timestamp: Date;
  sources?: MessageSource[];
  steps?: string[];
  loading?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface DatabaseMessage {
  id?: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  sources?: MessageSource[];
  steps?: string[];
}

interface DatabaseConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

// Error handling utility
function handleError(error: PostgrestError | Error | unknown, operation: string): never {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`Error in ${operation}:`, error);
  
  if (error instanceof PostgrestError) {
    console.error(`PostgrestError code: ${error.code}, details: ${error.details}`);
  }
  
  throw typeof error === 'object' && error !== null 
    ? error 
    : new Error(`Unknown error in ${operation}`);
}

/**
 * Load all conversations for a specific user
 * @param userId The ID of the user whose conversations to load
 * @returns An array of conversation objects
 */
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  try {
    // Get all conversations for this user
    const { data: conversationsData, error: conversationsError } = await supabase
      .from('knowledge_conversations')
      .select('id, title, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (conversationsError) throw conversationsError;
    if (!conversationsData || conversationsData.length === 0) return [];

    // For each conversation, get its messages
    const conversations = await Promise.all(
      conversationsData.map(async (conv) => {
        try {
          const { data: messagesData, error: messagesError } = await supabase
            .from('knowledge_messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('timestamp', { ascending: true });

          if (messagesError) throw messagesError;

          // Transform messages to the expected format
          const messages = messagesData?.map(msg => ({
            role: msg.role as MessageRole,
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
        } catch (error) {
          console.error(`Error loading messages for conversation ${conv.id}:`, error);
          // Return conversation with empty messages rather than failing the whole load
          return {
            id: conv.id,
            title: conv.title,
            messages: [],
            createdAt: new Date(conv.created_at),
            updatedAt: new Date(conv.updated_at)
          };
        }
      })
    );

    return conversations;
  } catch (error) {
    return handleError(error, 'getUserConversations');
  }
}

/**
 * Create a new conversation with a specific ID
 * @param userId The ID of the user creating the conversation
 * @param conversation The conversation object to create
 * @returns The created conversation object
 */
export async function createConversation(userId: string, conversation: Conversation): Promise<Conversation> {
  console.log('createConversation called with:', {
    userId,
    conversationId: conversation.id,
    title: conversation.title
  });
  
  try {
    // 1. Insert the conversation with the specified ID
    const { data: convData, error: convError } = await supabase
      .from('knowledge_conversations')
      .insert({
        id: conversation.id,
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

      // Insert messages in batches to avoid potential size limits
      const BATCH_SIZE = 50;
      for (let i = 0; i < messagesForInsert.length; i += BATCH_SIZE) {
        const batch = messagesForInsert.slice(i, i + BATCH_SIZE);
        const { error: msgError } = await supabase
          .from('knowledge_messages')
          .insert(batch);

        if (msgError) {
          console.error('Error inserting messages batch:', msgError);
          throw msgError;
        }
      }
      
      console.log(`Successfully inserted ${conversation.messages.length} messages`);
    } else {
      console.log('No messages to insert for new conversation');
    }

    // 3. Return the original conversation object
    return conversation;
  } catch (error) {
    return handleError(error, 'createConversation');
  }
}

/**
 * Add a message to an existing conversation
 * @param conversationId The ID of the conversation to add the message to
 * @param message The message object to add
 */
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
    handleError(error, 'addMessageToConversation');
  }
}

/**
 * Update an existing message in a conversation
 * @param conversationId The ID of the conversation containing the message
 * @param message The updated message object
 * @param messageId Optional specific message ID to update
 */
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
    handleError(error, 'updateMessage');
  }
}

/**
 * Delete a conversation and all its messages
 * @param conversationId The ID of the conversation to delete
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  try {
    // Due to cascade delete, we only need to delete the conversation
    const { error } = await supabase
      .from('knowledge_conversations')
      .delete()
      .eq('id', conversationId);

    if (error) throw error;
  } catch (error) {
    handleError(error, 'deleteConversation');
  }
}

/**
 * Find a message ID based on conversation ID and timestamp
 * @param conversationId The ID of the conversation containing the message
 * @param timestamp The timestamp of the message to find
 * @returns The message ID if found, null otherwise
 */
export async function getMessageId(conversationId: string, timestamp: Date): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('knowledge_messages')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('timestamp', timestamp.toISOString())
      .single();
    
    if (error) return null;
    return data?.id || null;
  } catch (error) {
    console.error('Error in getMessageId:', error);
    return null;
  }
}