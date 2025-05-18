import { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import { Send, Trash2, Brain, Plus, MessageSquare, CornerRightDown, Search, ArrowLeft, ChevronRight, Menu, X, PlayCircle, Youtube, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/lib/auth-context';
import { getUserDisplayName } from '@/lib/utils';
import { queryRagSystem } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  getUserConversations, 
  createConversation, 
  addMessageToConversation as saveMessageToConversation, 
  deleteConversation,
  updateMessage,
  Message as DatabaseMessage,
  Conversation as DatabaseConversation
} from '@/lib/conversations';
import { supabase } from '@/lib/supabase';

// Define types
type Source = {
  content: string;
  url?: string;
  title?: string;
  author?: string;
  domain?: string;
  search_rank?: number;
  source_type?: string;
  result_score?: number;
  metadata?: {
    source?: string;
    title?: string;
    url?: string;
    domain?: string;
    rank?: number;
    source_type?: string;
    [key: string]: any;
  };
};

type Message = {
  role: 'user' | 'assistant';
  content: string;
  loading?: boolean;
  timestamp: Date;
  sources?: Source[];
  steps?: string[];
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
};

// Utility functions for conversation handling
// These are extracted from the component for better code organization

/**
 * Save an assistant message directly to Supabase
 * Guaranteed to save even if other approaches fail
 */
async function saveAssistantMessage(
  conversationId: string, 
  content: string, 
  timestamp: Date,
  sources: any[] = [],
  steps: string[] = []
): Promise<void> {
  console.log('*** DIRECT SAVE - Saving assistant message ***');
  console.log(`Saving assistant message with content length: ${content.length}`);
  
  try {
    // Direct insert to Supabase
    console.log('Performing direct insert to Supabase for assistant message');
    const { error } = await supabase
      .from('knowledge_messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: content,
        timestamp: timestamp.toISOString(),
        sources: sources || [],
        steps: steps || []
      });
      
    if (error) {
      console.error('Error in direct save of assistant message:', error);
      throw error;
    } else {
      console.log('Successfully saved assistant message directly to Supabase');
    }
  } catch (err) {
    console.error('Exception in saveAssistantMessage:', err);
    throw err;
  }
}

/**
 * Create a conversation title from the first user message
 */
function generateConversationTitle(message: string): string {
  return message.length > 25 
    ? `${message.substring(0, 25)}...` 
    : message;
}

/**
 * Format a conversation date for display
 */
function formatConversationDate(date: Date): string {
  const now = new Date();
  const conversationDate = new Date(date);
  
  // If today, show time
  if (conversationDate.toDateString() === now.toDateString()) {
    return conversationDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }
  
  // If this year, show month and day
  if (conversationDate.getFullYear() === now.getFullYear()) {
    return conversationDate.toLocaleDateString([], {month: 'short', day: 'numeric'});
  }
  
  // Otherwise show date with year
  return conversationDate.toLocaleDateString([], {year: 'numeric', month: 'short', day: 'numeric'});
}

/**
 * Extract YouTube video ID from various URL formats
 */
function extractYoutubeVideoId(url: string): string | null {
  if (!url) return null;
  
  try {
    // First, try to create a URL object to handle proper URLs
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // Check if it's a YouTube domain
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      // Handle youtube.com domain
      if (hostname.includes('youtube.com')) {
        // Handle /watch URLs
        if (urlObj.pathname.includes('/watch')) {
          return urlObj.searchParams.get('v');
        }
        
        // Handle /embed/ URLs
        if (urlObj.pathname.includes('/embed/')) {
          return urlObj.pathname.split('/embed/')[1].split('/')[0];
        }
        
        // Handle shortened /v/ URLs
        if (urlObj.pathname.includes('/v/')) {
          return urlObj.pathname.split('/v/')[1].split('/')[0];
        }
      }
      
      // Handle youtu.be domain (short URLs)
      if (hostname.includes('youtu.be')) {
        return urlObj.pathname.split('/')[1];
      }
    }
  } catch (e) {
    // If URL parsing fails, fall back to regex approach
    const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return match[2];
    }
  }
  
  return null;
}

/**
 * Check if a source is a YouTube video based on domain, source type, or URL
 */
function isYoutubeSource(sourceType?: string, domain?: string, url?: string): boolean {
  if (sourceType?.toLowerCase().includes('youtube') || domain?.toLowerCase().includes('youtube')) {
    return true;
  }
  
  if (url) {
    // Check if URL contains youtube.com or youtu.be
    return url.includes('youtube.com') || url.includes('youtu.be');
  }
  
  return false;
}

/**
 * Component to display a YouTube video thumbnail with a play button overlay
 */
function YoutubeThumbnail({ videoId, title }: { videoId: string, title?: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden border border-gray-100 rounded group">
      <a 
        href={`https://www.youtube.com/watch?v=${videoId}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block h-full"
      >
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
          <div className="bg-white rounded-full p-1 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
            <PlayCircle className="h-5 w-5 text-red-600" />
          </div>
        </div>
        <img 
          src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} 
          alt={title || "YouTube video"} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {title && title.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 py-1 px-1.5 truncate z-10">
            <span className="text-[9px] text-white truncate block font-medium">{title}</span>
          </div>
        )}
      </a>
    </div>
  );
}

const FitnessKnowledge = () => {
  // Hooks and state
  const { user } = useAuth();
  const { toast } = useToast();
  const displayName = getUserDisplayName(user);
  
  // Chat and conversation state
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  
  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
    // Always show welcome screen initially
    return null;
  });
  
  const [showConversationsList, setShowConversationsList] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Refs
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Current conversation based on activeConversationId
  const activeConversation = activeConversationId 
    ? conversations.find(c => c.id === activeConversationId) 
    : null;
  
  // Filtered conversations based on search
  const filteredConversations = searchQuery.trim() === '' 
    ? conversations
    : conversations.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
      );
  
  // Effects
  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current && activeConversation) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [activeConversation?.messages]);

  // Load conversations from Supabase with localStorage fallback
  useEffect(() => {
    const loadConversations = async () => {
      if (!user) return;
      
      setIsLoadingConversations(true);
      try {
        // Try Supabase first
        const supabaseConversations = await getUserConversations(user.id);
        
        if (supabaseConversations.length > 0) {
          // Use Supabase data if available
          setConversations(supabaseConversations);
        } else {
          // Fall back to localStorage if no Supabase data
          const savedConversations = localStorage.getItem(`fitness-knowledge-conversations-${user.id}`);
          if (savedConversations) {
            try {
              const localConversations = JSON.parse(savedConversations);
              setConversations(localConversations);
              
              // Optionally migrate localStorage data to Supabase
              for (const conv of localConversations) {
                try {
                  await createConversation(user.id, conv);
                } catch (e) {
                  console.error('Error migrating conversation to Supabase:', e);
                }
              }
            } catch (e) {
              console.error('Error parsing saved conversations:', e);
            }
          }
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
        // Fall back to localStorage on error
        const savedConversations = localStorage.getItem(`fitness-knowledge-conversations-${user.id}`);
        if (savedConversations) {
          try {
            setConversations(JSON.parse(savedConversations));
          } catch (e) {
            console.error('Error parsing saved conversations:', e);
          }
        }
      } finally {
        setIsLoadingConversations(false);
      }
    };

    loadConversations();
  }, [user]);

  // Keep localStorage as a backup for now
  useEffect(() => {
    if (user) {
      localStorage.setItem(`fitness-knowledge-conversations-${user.id}`, JSON.stringify(conversations));
    }
  }, [conversations, user]);
  
  // Save active conversation id to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      if (activeConversationId) {
        localStorage.setItem(`fitness-knowledge-active-conversation-${user.id}`, activeConversationId);
      } else {
        localStorage.removeItem(`fitness-knowledge-active-conversation-${user.id}`);
      }
    }
  }, [activeConversationId, user]);

  // Set page title
  useEffect(() => {
    document.title = "Fitness Knowledge Chat";
    return () => {
      document.title = "One Page Fitness Pal"; // Reset title on unmount
    };
  }, []);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current && activeConversation) {
      inputRef.current.focus();
    }
  }, [activeConversation]);

  // Add an effect to load the conversations but not set an active one
  useEffect(() => {
    // Load conversations from localStorage but don't set an active one
    if (typeof window !== 'undefined' && user) {
      const savedActiveConversation = localStorage.getItem(`fitness-knowledge-active-conversation-${user.id}`);
      // We know it exists but we don't set it active
      if (savedActiveConversation) {
        // Optionally you can do something with this info if needed
      }
    }
  }, [user]);

  // Set initial sidebar state based on screen size
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };
    
    // Check on initial load
    checkScreenSize();
    
    // Listen for resize events
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Expert suggestion data
  const expertSuggestions = [
    {
      expert: "Jeff Cavaliere (AthleanX)",
      icon: "💪",
      color: "from-amber-100 to-amber-50",
      suggestions: [
        "What does AthleanX recommend for fixing shoulder pain?",
        "Best AthleanX exercises for sixpack abs?",
        "Jeff Cavaliere's advice on muscle imbalances?"
      ]
    },
    {
      expert: "Jeff Nippard",
      icon: "🏋️",
      color: "from-blue-100 to-blue-50",
      suggestions: [
        "Jeff Nippard's advice on progressive overload?",
        "How does Jeff Nippard structure his split?",
        "Jeff Nippard's protein intake recommendations?"
      ]
    },
    {
      expert: "Renaissance Periodization",
      icon: "🧠",
      color: "from-purple-100 to-purple-50",
      suggestions: [
        "Renaissance Periodization approach to fat loss?",
        "Dr. Mike Israetel's volume landmarks for hypertrophy?",
        "RP's advice on training frequency per muscle group?"
      ]
    }
  ];

  // Handlers
  const createNewConversation = () => {
    // Set activeConversationId to null to show welcome screen first
    setActiveConversationId(null);
    setShowConversationsList(false);
    setInputValue('');
  };
  
  const startNewChat = async () => {
    // Use crypto.randomUUID() to generate a proper UUID
    const newConversation: DatabaseConversation = {
      id: crypto.randomUUID(),
      title: "New Conversation",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Update UI immediately
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    
    // Then save to Supabase
    try {
      await createConversation(user.id, newConversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Warning",
        description: "Conversation created but may not sync across devices.",
        variant: "destructive",
      });
    }
  };
  
  const updateConversationTitle = (conversationId: string, firstUserMessage: string) => {
    const title = generateConversationTitle(firstUserMessage);
    
    // Update UI immediately
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? {...conv, title, updatedAt: new Date()} 
          : conv
      )
    );
    
    // Then update in Supabase
    try {
      supabase
        .from('knowledge_conversations')
        .update({ 
          title,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)
        .then(({ error }) => {
          if (error) {
            console.error('Error updating conversation title:', error);
            toast({
              title: "Warning",
              description: "Conversation title may not sync across devices",
              variant: "destructive",
            });
          }
        });
    } catch (error) {
      console.error('Error updating conversation title:', error);
    }
  };

  const addMessageToConversation = (conversationId: string, message: DatabaseMessage, skipSave: boolean = false) => {
    // Update UI immediately
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? {
              ...conv, 
              messages: [...conv.messages, message],
              updatedAt: new Date()
            }
          : conv
      )
    );
    
    // Then save to Supabase (if not skipped)
    if (!skipSave) {
      try {
        saveMessageToConversation(conversationId, message)
          .catch(error => {
            console.error('Error adding message to conversation:', error);
            toast({
              title: "Error",
              description: "Failed to save message. Your message is visible but may not sync across devices.",
              variant: "destructive",
            });
          });
      } catch (error) {
        console.error('Error adding message to conversation:', error);
      }
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isProcessing) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Store timestamps for later use
    const userMessageTimestamp = new Date();
    const assistantMessageTimestamp = new Date();
    
    // Track conversation info
    let conversationId: string;
    let isNewConversation = false;
    
    // Create a new conversation if none is active
    if (!activeConversation) {
      isNewConversation = true;
      conversationId = crypto.randomUUID();
      
      const newConversation: DatabaseConversation = {
        id: conversationId,
        title: generateConversationTitle(userMessage),
        messages: [
          { 
            role: 'user', 
            content: userMessage,
            timestamp: userMessageTimestamp
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Update UI with new conversation
      setConversations(prev => [newConversation, ...prev]);
      setActiveConversationId(conversationId);
      
      // For new conversations, save the conversation and user message upfront
      try {
        // Create the conversation in Supabase first
        console.log('Creating new conversation upfront:', conversationId);
        await createConversation(user.id, newConversation);
      } catch (err) {
        console.error('Error creating new conversation upfront:', err);
        toast({
          title: "Warning",
          description: "Could not sync conversation. Changes may not appear on other devices.",
          variant: "destructive",
        });
      }
      
      // Add placeholder for assistant response - only in UI, not in Supabase
      addMessageToConversation(conversationId, { 
        role: 'assistant', 
        content: '', 
        loading: true,
        timestamp: assistantMessageTimestamp
      }, true); // Skip saving placeholder to Supabase
    } else {
      conversationId = activeConversation.id;
      
      // Add user message to existing conversation
      addMessageToConversation(activeConversation.id, { 
        role: 'user', 
        content: userMessage,
        timestamp: userMessageTimestamp
      });
      
      // If this is the first user message, update the title
      if (activeConversation.messages.length === 0) {
        updateConversationTitle(activeConversation.id, userMessage);
      }
      
      // Add placeholder for assistant response - only in UI, not in Supabase
      addMessageToConversation(activeConversation.id, { 
        role: 'assistant', 
        content: '', 
        loading: true,
        timestamp: assistantMessageTimestamp
      }, true); // Skip saving placeholder to Supabase
    }
    
    setIsProcessing(true);

    // Variables to track streamed content
    let accumulatedAnswer = '';
    let currentSources: any[] = [];
    let currentSteps: string[] = [];
    
    try {
      // Function to update the assistant's message as streaming comes in
      const updateAssistantMessage = (content: string) => {
        console.log('Updating assistant message with new content:', content.length);
        
        // Keep track of the latest content
        accumulatedAnswer = content;
        
        setConversations(prev => {
          const newConversations = [...prev];
          const convIndex = newConversations.findIndex(c => c.id === activeConversationId);
          
          if (convIndex >= 0) {
            const conversation = newConversations[convIndex];
            const lastIndex = conversation.messages.length - 1;
            
            if (lastIndex >= 0 && conversation.messages[lastIndex].role === 'assistant') {
              const updatedMessages = [...conversation.messages];
              // Preserve any existing steps and sources when updating the content
              const preservedSteps = updatedMessages[lastIndex].steps || [];
              const preservedSources = updatedMessages[lastIndex].sources || [];
              
              updatedMessages[lastIndex] = { 
                role: 'assistant', 
                content, 
                timestamp: updatedMessages[lastIndex].timestamp,
                // Keep the steps and sources when updating content
                steps: preservedSteps,
                sources: preservedSources
              };
              
              newConversations[convIndex] = {
                ...conversation,
                messages: updatedMessages,
                updatedAt: new Date()
              };
            }
          }
          
          return newConversations;
        });
      };

      // Step update handler
      const handleStepUpdate = (step: string) => {
        currentSteps.push(step);
        console.log('Processing step:', step);
        console.log('Current steps array length:', currentSteps.length);
        
        // Update the message with the current steps - UI only, not Supabase
        setConversations(prev => {
          const newConversations = [...prev];
          const convIndex = newConversations.findIndex(c => c.id === activeConversationId);
          
          if (convIndex >= 0) {
            const conversation = newConversations[convIndex];
            const lastIndex = conversation.messages.length - 1;
            
            if (lastIndex >= 0 && conversation.messages[lastIndex].role === 'assistant') {
              const updatedMessages = [...conversation.messages];
              updatedMessages[lastIndex] = { 
                ...updatedMessages[lastIndex],
                steps: [...currentSteps],
                timestamp: updatedMessages[lastIndex].timestamp
              };
              
              console.log('Updated message with steps:', updatedMessages[lastIndex]);
              
              newConversations[convIndex] = {
                ...conversation,
                messages: updatedMessages,
                updatedAt: new Date()
              };
            }
          }
          
          return newConversations;
        });
      };

      // Source update handler
      const handleSourceUpdate = (source: any) => {
        currentSources.push(source);
        console.log('Source found:', source);
        console.log('Current sources array length:', currentSources.length);
        
        // Update the message with the current sources - UI only, not Supabase
        setConversations(prev => {
          const newConversations = [...prev];
          const convIndex = newConversations.findIndex(c => c.id === activeConversationId);
          
          if (convIndex >= 0) {
            const conversation = newConversations[convIndex];
            const lastIndex = conversation.messages.length - 1;
            
            if (lastIndex >= 0 && conversation.messages[lastIndex].role === 'assistant') {
              const updatedMessages = [...conversation.messages];
              updatedMessages[lastIndex] = { 
                ...updatedMessages[lastIndex],
                sources: [...currentSources],
                timestamp: updatedMessages[lastIndex].timestamp
              };
              
              console.log('Updated message with sources:', updatedMessages[lastIndex]);
              
              newConversations[convIndex] = {
                ...conversation,
                messages: updatedMessages,
                updatedAt: new Date()
              };
            }
          }
          
          return newConversations;
        });
      };

      // Error handler
      const handleError = (error: string) => {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      };

      // Query the RAG system with enhanced streaming support
      console.log('Starting queryRagSystem call');
      const finalAnswer = await queryRagSystem(
        user.id,
        conversationId,
        userMessage,
        updateAssistantMessage,
        handleStepUpdate,
        handleSourceUpdate,
        handleError
      );
      
      // Ensure we have the most up-to-date content
      accumulatedAnswer = finalAnswer || accumulatedAnswer;
      
      // Save the final assistant message to Supabase
      try {
        await saveAssistantMessage(
          conversationId,
          accumulatedAnswer,
          assistantMessageTimestamp,
          currentSources,
          currentSteps
        );
      } catch (error) {
        console.error('Failed to save assistant message:', error);
        toast({
          title: "Warning",
          description: "Response may not sync across devices.",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('Error querying RAG system:', error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
      
      // Update last message to show error
      setConversations(prev => {
        const newConversations = [...prev];
        const convIndex = newConversations.findIndex(c => c.id === activeConversationId);
        
        if (convIndex >= 0) {
          const conversation = newConversations[convIndex];
          const lastIndex = conversation.messages.length - 1;
          
          if (lastIndex >= 0 && conversation.messages[lastIndex].role === 'assistant') {
            const updatedMessages = [...conversation.messages];
            updatedMessages[lastIndex] = { 
              role: 'assistant', 
              content: "I'm sorry, I couldn't process your request. Please try again.",
              timestamp: updatedMessages[lastIndex].timestamp
            };
            
            newConversations[convIndex] = {
              ...conversation,
              messages: updatedMessages,
              updatedAt: new Date()
            };
          }
        }
        
        return newConversations;
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Delete a conversation
  const handleDeleteConversation = async (conversationId: string) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      // Update UI immediately
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      // If the deleted conversation was active, set activeConversationId to null
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
      }
      
      // Then delete from Supabase
      try {
        await deleteConversation(conversationId);
      } catch (error) {
        console.error('Error deleting conversation:', error);
        toast({
          title: "Warning",
          description: "Conversation may still appear on other devices.",
          variant: "destructive",
        });
      }
    }
  };

  // Switch to a different conversation
  const handleSwitchConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setShowConversationsList(false);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="w-full py-6 flex-1 flex flex-col">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-160px)] px-2 md:px-6 xl:px-8 relative">
          {/* Left sidebar - Conversation history */}
          <div className={cn(
            "col-span-12 md:col-span-3 lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full absolute md:relative z-20",
            "transform transition-all duration-300 ease-in-out",
            showConversationsList ? "translate-x-0" : "-translate-x-full md:translate-x-0",
            sidebarCollapsed && "md:hidden"
          )}>
            <div className="flex flex-col h-full">
              <div className="p-4 pb-2">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-fitness-charcoal">Conversation History</h3>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowConversationsList(false)}
                    className="md:hidden h-7 w-7 rounded-full hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="relative mb-3">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search conversations..." 
                    className="pl-9 py-1.5 h-9 bg-gray-50 border-gray-100 focus-visible:ring-fitness-purple/25"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={createNewConversation} 
                  className="w-full bg-fitness-purple hover:bg-fitness-purple/90 transition-colors mb-2"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  New Chat
                </Button>
              </div>
              
              <Separator className="bg-gray-100 mb-1" />
              
              <ScrollArea className="flex-1 px-2 py-1">
                <AnimatePresence>
                  {filteredConversations.length > 0 ? (
                    <div className="space-y-0.5">
                      {filteredConversations.map((conversation, index) => (
                        <motion.div
                          key={conversation.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                          <div
                            className={cn(
                              "flex items-center justify-between p-2 rounded-lg cursor-pointer group transition-colors",
                              activeConversationId === conversation.id 
                                ? "bg-fitness-purple-light text-fitness-purple"
                                : "hover:bg-gray-50"
                            )}
                            onClick={() => handleSwitchConversation(conversation.id)}
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <MessageSquare className="h-4 w-4 flex-shrink-0" />
                              <div className="flex flex-col">
                                <span className="truncate text-sm font-medium">{conversation.title}</span>
                                <span className="text-xs text-muted-foreground truncate">
                                  {formatConversationDate(conversation.updatedAt)}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteConversation(conversation.id);
                              }}
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-red-50 hover:text-red-500"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-sm text-muted-foreground p-4">
                      {searchQuery ? "No matching conversations found" : "No conversations yet"}
                    </div>
                  )}
                </AnimatePresence>
              </ScrollArea>
            </div>
          </div>
          
          {/* Sidebar toggle button - visible only on md+ screens */}
          <div className={cn(
            "hidden md:flex absolute top-1/2 -translate-y-1/2 z-30 transition-all duration-300",
            sidebarCollapsed ? "left-4" : "left-[calc(25%-12px)] lg:left-[calc(16.666%-12px)]"
          )}>
            <Button
              variant={sidebarCollapsed ? "default" : "ghost"}
              size="icon"
              onClick={toggleSidebar}
              className={cn(
                "h-9 w-9 rounded-full shadow-sm transition-all duration-300 border",
                sidebarCollapsed 
                  ? "bg-fitness-purple hover:bg-fitness-purple/90 text-white border-fitness-purple/30" 
                  : "bg-white/80 backdrop-blur-sm hover:bg-white text-fitness-purple border-gray-200/50"
              )}
            >
              {sidebarCollapsed ? (
                <MessageSquare className="h-4 w-4 transition-all" />
              ) : (
                <ChevronRight className="h-4 w-4 transition-all" />
              )}
            </Button>
          </div>
          
          {/* Main chat area */}
          <div className={cn(
            "col-span-12 md:col-span-9 lg:col-span-10 flex flex-col h-full max-h-[calc(100vh-160px)] overflow-hidden transition-all duration-300",
            sidebarCollapsed && "md:col-span-12 lg:col-span-12"
          )}>
            {/* Header with title and controls */}
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowConversationsList(true)}
                  className="mr-2 md:hidden h-9 w-9 rounded-full hover:bg-gray-100"
                >
                  <Menu className="h-5 w-5 text-fitness-purple" />
                </Button>
                
                {activeConversation && (
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-fitness-purple to-purple-500 flex items-center justify-center shadow-sm">
                        <Brain className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-medium text-fitness-charcoal flex items-center">
                          {activeConversation.title}
                          {isProcessing && (
                            <div className="ml-3 flex items-center">
                              <div className="animate-pulse h-1.5 w-1.5 rounded-full bg-fitness-purple mr-1"></div>
                              <div className="animate-pulse h-1.5 w-1.5 rounded-full bg-fitness-purple mr-1" style={{ animationDelay: '300ms' }}></div>
                              <div className="animate-pulse h-1.5 w-1.5 rounded-full bg-fitness-purple" style={{ animationDelay: '600ms' }}></div>
                            </div>
                          )}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          {formatConversationDate(activeConversation.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {activeConversation && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={createNewConversation}
                    className="hidden md:flex items-center gap-1.5 border-gray-200 hover:bg-gray-50 hover:text-fitness-purple transition-colors h-9 px-3 rounded-full"
                  >
                    <Plus className="h-4 w-4" />
                    New Chat
                  </Button>
                </div>
              )}
            </div>
            
            {/* Chat content */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {activeConversation ? (
                /* Active chat with messages */
                <div className="flex flex-col h-full">
                  {/* Message container with fixed height */}
                  <div className="flex-1 overflow-hidden min-h-0 relative mb-4">
                    <div className="absolute top-0 w-full h-16 bg-gradient-to-b from-gray-50 via-gray-50 to-transparent z-10 pointer-events-none" />
                    
                    <ScrollArea 
                      className="h-full overflow-y-auto pr-2" 
                      ref={scrollAreaRef}
                    >
                      <div className="px-4 py-4">
                        {/* Date separators with grouping */}
                        {(() => {
                          // Group messages by date
                          const messagesByDate: Record<string, Message[]> = {};
                          
                          activeConversation.messages.forEach(msg => {
                            const date = new Date(msg.timestamp);
                            const dateStr = date.toLocaleDateString();
                            
                            if (!messagesByDate[dateStr]) {
                              messagesByDate[dateStr] = [];
                            }
                            
                            messagesByDate[dateStr].push(msg);
                          });
                          
                          // Render each date group
                          return Object.entries(messagesByDate).map(([dateStr, messages]) => (
                            <div key={dateStr} className="mb-6 last:mb-0">
                              <div className="flex items-center justify-center mb-4">
                                <div className="h-px bg-gray-200 flex-1" />
                                <Badge 
                                  variant="outline" 
                                  className="mx-2 px-3 py-1 bg-white text-xs text-gray-500 font-normal"
                                >
                                  {new Date(dateStr).toLocaleDateString(undefined, { 
                                    weekday: 'short', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </Badge>
                                <div className="h-px bg-gray-200 flex-1" />
                              </div>
                              
                              {/* Group consecutive messages by the same role */}
                              {(() => {
                                const messageGroups: Message[][] = [];
                                let currentGroup: Message[] = [];
                                
                                messages.forEach((msg, i) => {
                                  if (i === 0 || msg.role === messages[i-1].role) {
                                    currentGroup.push(msg);
                                  } else {
                                    messageGroups.push([...currentGroup]);
                                    currentGroup = [msg];
                                  }
                                });
                                
                                if (currentGroup.length > 0) {
                                  messageGroups.push(currentGroup);
                                }
                                
                                return messageGroups.map((group, groupIndex) => (
                                  <div key={groupIndex} className="mb-6 last:mb-0">
                                    {group[0].role === 'assistant' ? (
                                      <>
                                        <div className="space-y-1">
                                          {group.map((message, msgIndex) => (
                                            <motion.div
                                              key={`${dateStr}-${groupIndex}-${msgIndex}`}
                                              initial={{ opacity: 0, y: 10 }}
                                              animate={{ opacity: 1, y: 0 }}
                                              transition={{ duration: 0.2 }}
                                              className="max-w-[85%]"
                                            >
                                              <div
                                                className={cn(
                                                  "rounded-2xl p-4",
                                                  "bg-transparent text-gray-800",
                                                  // Special radius for grouped messages
                                                  msgIndex === 0 && group.length > 1 && "rounded-bl-md",
                                                  msgIndex > 0 && msgIndex < group.length - 1 && "rounded-l-md",
                                                  msgIndex === group.length - 1 && group.length > 1 && "rounded-tl-md"
                                                )}
                                              >
                                                {message.loading ? (
                                                  <div className="flex items-center space-x-2">
                                                    <LoadingSpinner size="sm" />
                                                    <span>Thinking...</span>
                                                  </div>
                                                ) : (
                                                  <>
                                                    <ReactMarkdown 
                                                      remarkPlugins={[remarkGfm]}
                                                      components={{
                                                        p: ({ children }) => <p className="prose prose-sm max-w-none mb-2">{children}</p>,
                                                        ul: ({ children }) => <ul className="list-disc pl-4 my-1.5">{children}</ul>,
                                                        ol: ({ children }) => <ol className="list-decimal pl-4 my-1.5">{children}</ol>,
                                                        li: ({ children }) => <li className="my-0.5">{children}</li>,
                                                        h3: ({ children }) => <h3 className="text-lg font-semibold my-2">{children}</h3>,
                                                        h4: ({ children }) => <h4 className="text-md font-semibold my-1.5">{children}</h4>,
                                                        a: ({ children, href }) => (
                                                          <a 
                                                            href={href} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            className="text-gray-700 hover:text-blue-600 hover:underline transition-colors"
                                                          >
                                                            {children}
                                                          </a>
                                                        ),
                                                        code: ({ children }) => (
                                                          <code className="bg-gray-100 px-1 py-0.5 rounded text-red-500 text-sm">
                                                            {children}
                                                          </code>
                                                        ),
                                                        pre: ({ children }) => (
                                                          <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto my-2 text-sm">
                                                            {children}
                                                          </pre>
                                                        )
                                                      }}
                                                    >
                                                      {message.content}
                                                    </ReactMarkdown>
                                                    
                                                    {/* Display processing steps if available */}
                                                    {message.steps && message.steps.length > 0 && (
                                                      <div className="mt-3 bg-fitness-purple-light/20 rounded-lg p-2 border border-fitness-purple-light/30">
                                                        <details className="text-xs">
                                                          <summary className="font-medium text-fitness-purple cursor-pointer">
                                                            View processing steps ({message.steps.length})
                                                          </summary>
                                                          <div className="pt-2 pb-1 pl-1">
                                                            <ul className="space-y-1">
                                                              {message.steps.map((step, stepIndex) => (
                                                                <li key={stepIndex} className="flex items-start">
                                                                  <span className="inline-block w-4 h-4 bg-fitness-purple-light/80 rounded-full text-fitness-purple text-center text-[10px] mr-2 flex-shrink-0 mt-0.5">
                                                                    {stepIndex + 1}
                                                                  </span>
                                                                  <span className="text-gray-700">{step}</span>
                                                                </li>
                                                              ))}
                                                            </ul>
                                                          </div>
                                                        </details>
                                                      </div>
                                                    )}
                                                    
                                                    {/* Display sources if available */}
                                                    {message.sources && message.sources.length > 0 && (
                                                      <div className="mt-3 bg-blue-50/80 rounded-lg p-2 border border-blue-100/70">
                                                        <details className="text-xs">
                                                          <summary className="font-medium text-blue-600 cursor-pointer">
                                                            View sources ({message.sources.length})
                                                          </summary>
                                                          <div className="pt-4 pb-1">
                                                            {/* YouTube Thumbnails Grid - Display all YouTube sources at the top in a grid */}
                                                            {message.sources.some(src => 
                                                              isYoutubeSource(
                                                                src.source_type || src.metadata?.source_type, 
                                                                src.domain || src.metadata?.domain, 
                                                                src.url || src.metadata?.url || src.metadata?.source
                                                              ) && extractYoutubeVideoId(src.url || src.metadata?.url || src.metadata?.source || '')
                                                            ) && (
                                                              <div className="mb-5 pb-3 border-b border-blue-100">
                                                                <div className="flex items-center mb-2.5">
                                                                  <Badge className="bg-red-600 hover:bg-red-700 text-white text-xs px-2.5 py-0.5 mr-2 shadow-sm flex items-center gap-1.5">
                                                                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" focusable="false">
                                                                      <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.861-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z"></path>
                                                                    </svg>
                                                                    YouTube Sources
                                                                  </Badge>
                                                                </div>
                                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                                  {message.sources
                                                                    .filter(src => {
                                                                      const url = src.url || src.metadata?.url || src.metadata?.source;
                                                                      const domain = src.domain || src.metadata?.domain;
                                                                      const sourceType = src.source_type || src.metadata?.source_type;
                                                                      
                                                                      // Only include YouTube sources with valid video IDs
                                                                      return isYoutubeSource(sourceType, domain, url) && 
                                                                             extractYoutubeVideoId(url || '') !== null;
                                                                    })
                                                                    .map((ytSource, ytIndex) => {
                                                                      const url = ytSource.url || ytSource.metadata?.url || ytSource.metadata?.source || '';
                                                                      const title = ytSource.title || ytSource.metadata?.title || '';
                                                                      const videoId = extractYoutubeVideoId(url);
                                                                      
                                                                      // This should never be null due to our filter above
                                                                      if (!videoId) return <div key={`yt-empty-${ytIndex}`}></div>;
                                                                      
                                                                      return (
                                                                        <div key={`yt-${ytIndex}`} className="relative pb-[56.25%] h-0 overflow-hidden rounded shadow-sm">
                                                                          <div className="absolute inset-0">
                                                                            <YoutubeThumbnail 
                                                                              videoId={videoId} 
                                                                              title={title.length > 40 ? `${title.substring(0, 40)}...` : title} 
                                                                            />
                                                                          </div>
                                                                        </div>
                                                                      );
                                                                    })
                                                                  }
                                                                </div>
                                                              </div>
                                                            )}
                                                            
                                                            {/* Web Search Results */}
                                                            {message.sources.some(src => 
                                                              !isYoutubeSource(
                                                                src.source_type || src.metadata?.source_type, 
                                                                src.domain || src.metadata?.domain, 
                                                                src.url || src.metadata?.url || src.metadata?.source
                                                              ) || extractYoutubeVideoId(src.url || src.metadata?.url || src.metadata?.source || '') === null
                                                            ) && (
                                                              <div className="mt-1">
                                                                <div className="flex items-center mb-2">
                                                                  <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2.5 py-0.5 mr-2 flex items-center gap-1.5 shadow-sm">
                                                                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" focusable="false">
                                                                      <path d="M17.9,17.39C17.64,16.59 16.89,16 16,16H15V13A1,1 0 0,0 14,12H8V10H10A1,1 0 0,0 11,9V7H13A2,2 0 0,0 15,5V4.59C17.93,5.77 20,8.64 20,12C20,14.08 19.2,15.97 17.9,17.39M11,19.93C7.05,19.44 4,16.08 4,12C4,11.38 4.08,10.78 4.21,10.21L9,15V16A2,2 0 0,0 11,18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"></path>
                                                                    </svg>
                                                                    Web Search Results
                                                                  </Badge>
                                                                </div>
                                                                <ul className="space-y-2 divide-y divide-blue-100/80">
                                                                  {message.sources
                                                                    .slice()
                                                                    .filter(source => {
                                                                      const url = source.url || source.metadata?.url || source.metadata?.source;
                                                                      const domain = source.domain || source.metadata?.domain;
                                                                      const sourceType = source.source_type || source.metadata?.source_type;
                                                                      
                                                                      // Only include non-YouTube sources
                                                                      return !isYoutubeSource(sourceType, domain, url) || 
                                                                              extractYoutubeVideoId(url || '') === null;
                                                                    })
                                                                    .sort((a, b) => {
                                                                      // Handle both old and new data formats
                                                                      const rankA = a.search_rank !== undefined ? a.search_rank : 
                                                                                ((a.metadata?.rank as number) || 999);
                                                                      const rankB = b.search_rank !== undefined ? b.search_rank : 
                                                                                ((b.metadata?.rank as number) || 999);
                                                                      return rankA - rankB;
                                                                    })
                                                                    .map((source, sourceIndex) => {
                                                                      // Extract data from either direct properties or metadata
                                                                      const title = source.title || source.metadata?.title || 'Reference';
                                                                      const url = source.url || source.metadata?.url || source.metadata?.source;
                                                                      const domain = source.domain || source.metadata?.domain;
                                                                      const sourceType = source.source_type || source.metadata?.source_type;
                                                                      const author = source.author;
                                                                      const score = source.result_score;
                                                                      
                                                                      return (
                                                                        <li key={sourceIndex} className="pt-2 first:pt-0">
                                                                          <div className="flex items-center flex-wrap gap-1 mb-1">
                                                                            <span className="font-medium text-blue-800 mr-1">
                                                                              {title}
                                                                            </span>
                                                                            {domain && (
                                                                              <Badge 
                                                                                variant="outline" 
                                                                                className="bg-gray-50/80 border-gray-200 text-gray-600 text-[10px] px-1.5 py-0"
                                                                              >
                                                                                {domain}
                                                                              </Badge>
                                                                            )}
                                                                            {sourceType && sourceType !== "Web Search" && (
                                                                              <Badge 
                                                                                variant="outline" 
                                                                                className="bg-purple-50/80 border-purple-200 text-purple-600 text-[10px] px-1.5 py-0"
                                                                              >
                                                                                {sourceType}
                                                                              </Badge>
                                                                            )}
                                                                            {author && author !== "Web" && (
                                                                              <Badge 
                                                                                variant="outline" 
                                                                                className="bg-amber-50/80 border-amber-200 text-amber-600 text-[10px] px-1.5 py-0"
                                                                              >
                                                                                {author}
                                                                              </Badge>
                                                                            )}
                                                                            {score !== undefined && (
                                                                              <Badge 
                                                                                variant="outline" 
                                                                                className="bg-green-50/80 border-green-200 text-green-600 text-[10px] px-1.5 py-0"
                                                                              >
                                                                                Score: {(score * 100).toFixed(0)}%
                                                                              </Badge>
                                                                            )}
                                                                          </div>
                                                                          
                                                                          <div className="text-gray-600 pl-1 text-xs bg-white/70 p-1.5 rounded border border-blue-100/60">
                                                                            {source.content}
                                                                            {url && (
                                                                              <a 
                                                                                href={url} 
                                                                                target="_blank" 
                                                                                rel="noopener noreferrer" 
                                                                                className="mt-1 block text-gray-500 hover:text-blue-500 hover:underline text-[10px] truncate transition-colors"
                                                                              >
                                                                                {url}
                                                                              </a>
                                                                            )}
                                                                          </div>
                                                                        </li>
                                                                      );
                                                                    })
                                                                  }
                                                                </ul>
                                                              </div>
                                                            )}
                                                          </div>
                                                        </details>
                                                      </div>
                                                    )}
                                                    
                                                  </>
                                                )}
                                              </div>
                                              {/* Timestamp below message box - assistant */}
                                              {msgIndex === group.length - 1 && (
                                                <div className="text-[10px] mt-1 ml-2 text-gray-900">
                                                  {typeof message.timestamp === 'string' 
                                                    ? new Date(message.timestamp).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                      })
                                                    : message.timestamp.toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                      })
                                                  }
                                                </div>
                                              )}
                                            </motion.div>
                                          ))}
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className="text-xs font-medium text-fitness-purple mb-1 mr-1 text-right">
                                          You
                                        </div>
                                        <div className="space-y-1 flex flex-col items-end">
                                          {group.map((message, msgIndex) => (
                                            <motion.div
                                              key={`${dateStr}-${groupIndex}-${msgIndex}`}
                                              initial={{ opacity: 0, y: 10 }}
                                              animate={{ opacity: 1, y: 0 }}
                                              transition={{ duration: 0.2 }}
                                              className="max-w-[85%]"
                                            >
                                              <div
                                                className={cn(
                                                  "rounded-2xl p-4",
                                                  "bg-gradient-to-br from-fitness-purple to-fitness-purple/90 text-white shadow-sm",
                                                  // Special radius for grouped messages
                                                  msgIndex === 0 && group.length > 1 && "rounded-br-md",
                                                  msgIndex > 0 && msgIndex < group.length - 1 && "rounded-r-md",
                                                  msgIndex === group.length - 1 && group.length > 1 && "rounded-tr-md"
                                                )}
                                              >
                                                <ReactMarkdown 
                                                  remarkPlugins={[remarkGfm]}
                                                  components={{
                                                    p: ({ children }) => <p className="prose prose-sm max-w-none mb-2">{children}</p>,
                                                    ul: ({ children }) => <ul className="list-disc pl-4 my-1.5">{children}</ul>,
                                                    ol: ({ children }) => <ol className="list-decimal pl-4 my-1.5">{children}</ol>,
                                                    li: ({ children }) => <li className="my-0.5">{children}</li>,
                                                    h3: ({ children }) => <h3 className="text-lg font-semibold my-2">{children}</h3>,
                                                    h4: ({ children }) => <h4 className="text-md font-semibold my-1.5">{children}</h4>,
                                                    a: ({ children, href }) => (
                                                      <a 
                                                        href={href} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="text-white/90 hover:text-white hover:underline transition-colors"
                                                      >
                                                        {children}
                                                      </a>
                                                    ),
                                                    code: ({ children }) => (
                                                      <code className="bg-white/20 px-1 py-0.5 rounded text-white text-sm">
                                                        {children}
                                                      </code>
                                                    ),
                                                    pre: ({ children }) => (
                                                      <pre className="bg-white/10 p-2 rounded-md overflow-x-auto my-2 text-sm">
                                                        {children}
                                                      </pre>
                                                    )
                                                  }}
                                                >
                                                  {message.content}
                                                </ReactMarkdown>
                                                
                                              </div>
                                              {/* Timestamp below message box - user */}
                                              {msgIndex === group.length - 1 && (
                                                <div className="text-[10px] mt-1 mr-2 text-black text-right">
                                                  {typeof message.timestamp === 'string' 
                                                    ? new Date(message.timestamp).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                      })
                                                    : message.timestamp.toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                      })
                                                  }
                                                </div>
                                              )}
                                            </motion.div>
                                          ))}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                ));
                              })()}
                            </div>
                          ));
                        })()}
                      </div>
                    </ScrollArea>
                  </div>
                  
                  {/* Input area - position it at the bottom with flex-shrink-0 */}
                  {/* Input area - position it at the bottom */}
                  <div className="flex mb-6 mt-4 flex-shrink-0">
                    <div className="relative flex-1">
                      <div className={cn(
                        "group relative flex items-center rounded-2xl overflow-hidden transition-all duration-300 shadow-sm",
                        isProcessing 
                          ? "bg-gradient-to-r from-purple-50 to-blue-50 shadow-md" 
                          : inputValue.trim() === ''
                            ? "bg-gradient-to-r from-blue-50 to-purple-50 hover:shadow-md"
                            : "bg-white hover:shadow-md"
                      )}>
                        <div className={cn(
                          "absolute left-0 top-0 bottom-0 w-[3px] rounded-l-full transition-all duration-300",
                          isProcessing 
                            ? "bg-gradient-to-b from-fitness-purple to-blue-400" 
                            : inputValue.trim() !== ''
                              ? "bg-gradient-to-b from-fitness-purple to-blue-400"
                              : "bg-transparent group-focus-within:bg-gradient-to-b from-fitness-purple to-blue-400"
                        )} />
                        
                        <Input
                          ref={inputRef}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Ask anything about fitness..."
                          disabled={isProcessing}
                          className={cn(
                            "flex-1 border-0 focus-visible:ring-0 h-16 pl-6 pr-24 bg-transparent transition-all text-base",
                            isProcessing ? "text-fitness-charcoal/90" : "text-fitness-charcoal"
                          )}
                        />
                        
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          {inputValue.trim().length > 0 && !isProcessing && (
                            <div className="text-xs text-muted-foreground animate-fadeIn mr-1">
                              Press Enter ↵
                            </div>
                          )}
                          
                          <Button 
                            onClick={handleSendMessage} 
                            disabled={isProcessing || inputValue.trim() === ''}
                            className={cn(
                              "rounded-xl h-11 w-11 p-0 transition-all duration-300 relative group/button",
                              isProcessing 
                                ? "bg-gray-200 cursor-not-allowed" 
                                : "bg-gradient-to-br from-fitness-purple to-purple-500 hover:from-fitness-purple/90 hover:to-purple-500/90 text-white shadow-sm"
                            )}
                          >
                            {isProcessing ? (
                              <div className="flex items-center justify-center animate-spin">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              </div>
                            ) : (
                              <>
                                <div className="bg-gradient-to-br from-white/20 to-transparent absolute inset-0 opacity-0 group-hover/button:opacity-100 transition-opacity rounded-xl"></div>
                                <Send className={cn(
                                  "h-5 w-5 transition-transform group-hover/button:scale-110",
                                  inputValue.trim() !== '' ? "text-white" : "text-gray-400"
                                )} />
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      {isProcessing && (
                        <div className="text-xs text-muted-foreground mt-2 ml-3 animate-fadeIn flex items-center">
                          <div className="mr-2 flex items-center space-x-1">
                            <div className="h-1.5 w-1.5 bg-fitness-purple rounded-full animate-pulse"></div>
                            <div className="h-1.5 w-1.5 bg-fitness-purple rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="h-1.5 w-1.5 bg-fitness-purple rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                          Searching knowledge base...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Welcome screen for new users */
                <div className="flex-1 flex flex-col items-center overflow-auto py-4 md:py-6">
                  <div className="text-center w-full mx-auto px-2 pb-6">
                    {/* Knowledge System Explanation Card */}
                    <motion.div 
                      className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl md:rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 mb-6 transition-all duration-300 hover:shadow-md max-w-3xl mx-auto"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="flex items-center justify-center h-12 w-12 bg-white rounded-full shadow-sm">
                          <Brain className="h-6 w-6 text-fitness-purple" />
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-r from-purple-200 to-transparent"></div>
                        <div className="flex items-center justify-center h-12 w-12 bg-white rounded-full shadow-sm">
                          <Search className="h-6 w-6 text-blue-500" />
                        </div>
                      </div>
                      <h3 className="text-lg md:text-xl font-semibold text-fitness-charcoal mb-3">
                        How Our Fitness Knowledge System Works
                      </h3>
                      <div className="text-gray-700 text-sm md:text-base space-y-3 max-w-2xl mx-auto">
                        <p>
                          Our AI-powered fitness assistant combines the knowledge from top fitness experts with advanced search capabilities:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                          <div className="bg-white/80 p-3 rounded-lg shadow-sm border border-purple-100">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Badge className="bg-fitness-purple text-white">Step 1</Badge>
                              <span className="font-medium text-fitness-charcoal">Knowledge Base Search</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              We search our extensive library of content from Jeff Nippard, AthleanX, and Renaissance Periodization videos.
                            </p>
                          </div>
                          <div className="bg-white/80 p-3 rounded-lg shadow-sm border border-blue-100">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Badge className="bg-blue-500 text-white">Step 2</Badge>
                              <span className="font-medium text-fitness-charcoal">Web Search Fallback</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              If we can't find relevant information in our knowledge base, we'll search the web for reliable answers.
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 italic mt-3">
                          We'll always cite our sources and tell you exactly where the information comes from.
                        </p>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="bg-gradient-to-r from-fitness-purple-light to-purple-50 rounded-xl md:rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 mb-6 transition-all duration-300 hover:shadow-md max-w-2xl mx-auto"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="h-16 w-16 rounded-full bg-white mx-auto mb-4 flex items-center justify-center shadow-sm">
                        <Brain className="h-8 w-8 text-fitness-purple" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-fitness-charcoal mb-3">
                        Fitness Knowledge AI
                      </h3>
                      <p className="text-gray-700 mb-4 max-w-lg mx-auto">
                        Get evidence-based answers from top fitness experts like AthleanX, Jeff Nippard, and Renaissance Periodization.
                      </p>
                      <div className="mb-5 flex flex-wrap gap-2 justify-center">
                        <Badge variant="outline" className="py-1.5 px-3 bg-amber-50 text-amber-700 border-amber-200">
                          Backed by YouTube's top fitness creators
                        </Badge>
                        <Badge variant="outline" className="py-1.5 px-3 bg-blue-50 text-blue-700 border-blue-200">
                          Reliable information with sources
                        </Badge>
                      </div>
                      <div>
                        <Button
                          onClick={startNewChat}
                          className="bg-gradient-to-r from-fitness-purple to-purple-500 hover:from-fitness-purple/90 hover:to-purple-500/90 transition-colors shadow-sm"
                          size="lg"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Start New Chat
                        </Button>
                      </div>
                    </motion.div>
                    
                    {/* Expert suggestions */}
                    <div className="mt-4 md:mt-6 w-full">
                      <h3 className="text-base md:text-lg font-semibold text-fitness-charcoal mb-4">Popular questions to get you started</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 max-w-5xl mx-auto">
                        {expertSuggestions.map((expertGroup, groupIndex) => (
                          <motion.div 
                            key={groupIndex}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 + groupIndex * 0.1 }}
                            className={`bg-gradient-to-r ${expertGroup.color} rounded-lg md:rounded-xl p-4 md:p-5 shadow-sm border border-gray-100`}
                          >
                            <div className="flex items-center mb-3">
                              <span className="text-2xl mr-2">{expertGroup.icon}</span>
                              <h4 className="font-medium text-fitness-charcoal text-sm md:text-base">{expertGroup.expert}</h4>
                            </div>
                            <ul className="space-y-1.5 md:space-y-2">
                              {expertGroup.suggestions.map((suggestion, suggIndex) => (
                                <li key={suggIndex} className="bg-white/80 rounded-lg shadow-sm">
                                  <button
                                    onClick={() => {
                                      startNewChat();
                                      // Small delay to ensure the new conversation is created before setting the input
                                      setTimeout(() => {
                                        handleSuggestionClick(suggestion);
                                        setTimeout(() => handleSendMessage(), 100);
                                      }, 50);
                                    }}
                                    className="flex items-center w-full p-2 text-left text-xs md:text-sm text-gray-700 hover:text-fitness-purple gap-2 group transition-colors"
                                  >
                                    <span className="flex-1 truncate">{suggestion}</span>
                                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-fitness-purple" />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile backdrop overlay */}
      {showConversationsList && (
        <div 
          className="fixed inset-0 bg-black/20 z-10 md:hidden"
          onClick={() => setShowConversationsList(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default FitnessKnowledge; 