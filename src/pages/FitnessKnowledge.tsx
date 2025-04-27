import { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import { Send, Trash2, Brain, Plus, MessageSquare, CornerRightDown } from 'lucide-react';
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

// Define types
type Message = {
  role: 'user' | 'assistant';
  content: string;
  loading?: boolean;
  timestamp: Date;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
};

const FitnessKnowledge = () => {
  // Hooks and state
  const { user } = useAuth();
  const { toast } = useToast();
  const displayName = getUserDisplayName(user);
  
  // Chat and conversation state
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    // Try to load conversations from localStorage
    if (typeof window !== 'undefined' && user) {
      const savedConversations = localStorage.getItem(`fitness-knowledge-conversations-${user.id}`);
      if (savedConversations) {
        try {
          return JSON.parse(savedConversations);
        } catch (e) {
          console.error('Error parsing saved conversations:', e);
        }
      }
    }
    return [];
  });
  
  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
    // Always show welcome screen initially
    return null;
  });
  
  const [showConversationsList, setShowConversationsList] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Refs
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Current conversation based on activeConversationId
  const activeConversation = activeConversationId 
    ? conversations.find(c => c.id === activeConversationId) 
    : null;
  
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

  // Save conversations to localStorage whenever they change
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

  // Expert suggestion data
  const expertSuggestions = [
    {
      expert: "Jeff Cavaliere (AthleanX)",
      suggestions: [
        "What does AthleanX recommend for fixing shoulder pain?",
        "Best AthleanX exercises for sixpack abs?",
        "Jeff Cavaliere's advice on muscle imbalances?"
      ]
    },
    {
      expert: "Jeff Nippard",
      suggestions: [
        "Jeff Nippard's advice on progressive overload?",
        "How does Jeff Nippard structure his split?",
        "Jeff Nippard's protein intake recommendations?"
      ]
    },
    {
      expert: "Renaissance Periodization",
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
  
  const startNewChat = () => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: "New Conversation",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
  };
  
  const updateConversationTitle = (conversationId: string, firstUserMessage: string) => {
    // Generate a title based on the first user message
    const title = firstUserMessage.length > 25 
      ? `${firstUserMessage.substring(0, 25)}...` 
      : firstUserMessage;
    
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? {...conv, title, updatedAt: new Date()} 
          : conv
      )
    );
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isProcessing) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Create a new conversation if none is active
    if (!activeConversation) {
      const newConversation: Conversation = {
        id: `conv-${Date.now()}`,
        title: userMessage.length > 25 ? `${userMessage.substring(0, 25)}...` : userMessage,
        messages: [
          { 
            role: 'user', 
            content: userMessage,
            timestamp: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setConversations(prev => [newConversation, ...prev]);
      setActiveConversationId(newConversation.id);
      
      // Add placeholder for assistant response
      addMessageToConversation(newConversation.id, { 
        role: 'assistant', 
        content: '', 
        loading: true,
        timestamp: new Date()
      });
    } else {
      // Add user message to existing conversation
      addMessageToConversation(activeConversation.id, { 
        role: 'user', 
        content: userMessage,
        timestamp: new Date()
      });
      
      // If this is the first user message, update the title
      if (activeConversation.messages.length === 0) {
        updateConversationTitle(activeConversation.id, userMessage);
      }
      
      // Add placeholder for assistant response
      addMessageToConversation(activeConversation.id, { 
        role: 'assistant', 
        content: '', 
        loading: true,
        timestamp: new Date()
      });
    }
    
    setIsProcessing(true);

    try {
      // Function to update the assistant's message as streaming comes in
      const updateAssistantMessage = (content: string) => {
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
                content, 
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
      };

      // Query the RAG system
      await queryRagSystem(userMessage, updateAssistantMessage);
      
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

  const addMessageToConversation = (conversationId: string, message: Message) => {
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
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Delete a conversation
  const handleDeleteConversation = (conversationId: string) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      // If the deleted conversation was active, set activeConversationId to null
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="w-full py-6 flex-1 flex flex-col">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-160px)] px-2 md:px-6 xl:px-8">
          {/* Left sidebar - Conversation history */}
          <div className={cn(
            "col-span-12 md:col-span-3 lg:col-span-2 p-4 overflow-hidden transition-all duration-300 h-full",
            showConversationsList ? "block" : "hidden md:block"
          )}>
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-fitness-charcoal">Conversation History</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowConversationsList(false)}
                  className="md:hidden"
                >
                  <CornerRightDown className="h-4 w-4" />
                </Button>
              </div>
              
              <ScrollArea className="flex-1 -mx-2 px-2">
                {conversations.length > 0 ? (
                  <div className="space-y-2">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg cursor-pointer group",
                          activeConversationId === conversation.id 
                            ? "bg-fitness-purple-light text-fitness-purple"
                            : "hover:bg-gray-100"
                        )}
                        onClick={() => handleSwitchConversation(conversation.id)}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <MessageSquare className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate text-sm">{conversation.title}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conversation.id);
                          }}
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-sm text-gray-500 mt-4">
                    No conversations yet
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
          
          {/* Main chat area */}
          <div className="col-span-12 md:col-span-9 lg:col-span-10 flex flex-col h-full">
            {/* Header with title and controls */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowConversationsList(true)}
                  className="mr-2 md:hidden"
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>
                
                {isProcessing && (
                  <div className="ml-3 flex items-center">
                    <div className="animate-pulse h-2 w-2 rounded-full bg-fitness-purple mr-1"></div>
                    <div className="animate-pulse h-2 w-2 rounded-full bg-fitness-purple mr-1" style={{ animationDelay: '300ms' }}></div>
                    <div className="animate-pulse h-2 w-2 rounded-full bg-fitness-purple" style={{ animationDelay: '600ms' }}></div>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={createNewConversation}
                  className="hidden md:flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Chat
                </Button>
              </div>
            </div>
            
            {/* Chat content */}
            <div className="flex-1 flex flex-col h-full">
              {activeConversation ? (
                /* Active chat with messages */
                <div className="flex-1 flex flex-col">
                  <Card className="flex-1 flex flex-col overflow-hidden p-0 border border-gray-200 shadow-sm rounded-xl mb-4">
                    <ScrollArea className="flex-1 px-4 pt-4 pb-2" ref={scrollAreaRef}>
                      <div className="space-y-6">
                        {activeConversation.messages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${
                              message.role === 'user' ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={cn(
                                "max-w-[85%] rounded-2xl p-4",
                                message.role === 'user'
                                  ? "bg-fitness-purple text-white"
                                  : "bg-gray-100 text-gray-800"
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
                                      p: ({ children }) => <p className="prose prose-sm max-w-none mb-1">{children}</p>,
                                      ul: ({ children }) => <ul className="list-disc pl-4 my-1">{children}</ul>,
                                      ol: ({ children }) => <ol className="list-decimal pl-4 my-1">{children}</ol>,
                                      li: ({ children }) => <li className="my-0.5">{children}</li>,
                                      h3: ({ children }) => <h3 className="text-lg font-semibold my-2">{children}</h3>,
                                      h4: ({ children }) => <h4 className="text-md font-semibold my-1">{children}</h4>
                                    }}
                                  >
                                    {message.content}
                                  </ReactMarkdown>
                                  <div className="text-xs opacity-50 mt-2 text-right">
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
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </Card>
                  
                  {/* Input area */}
                  <div className="flex space-x-2 mb-4 max-w-full">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask anything about fitness..."
                      disabled={isProcessing}
                      className={cn(
                        "flex-1 bg-white border-gray-200 rounded-full h-12 pl-4 pr-4 shadow-sm transition-all duration-300",
                        isProcessing ? "border-fitness-purple shadow-sm shadow-fitness-purple/10" : ""
                      )}
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={isProcessing || inputValue.trim() === ''}
                      className={cn(
                        "rounded-full h-12 w-12 p-0 transition-all duration-300",
                        isProcessing 
                          ? "bg-fitness-purple/70 cursor-not-allowed" 
                          : "bg-fitness-purple hover:bg-fitness-purple/90"
                      )}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ) : (
                /* Welcome screen for new users */
                <div className="flex-1 flex flex-col items-center justify-center max-w-full py-4 md:py-0">
                  <div className="text-center animate-fadeIn w-full mx-auto px-2">
                    <div className="bg-white rounded-xl md:rounded-2xl p-5 md:p-6 shadow-sm border border-gray-200 mb-6 transition-all duration-300 hover:shadow-md hover:border-fitness-purple/20 max-w-2xl mx-auto">
                      <Brain className="h-10 md:h-12 w-10 md:w-12 text-fitness-purple mx-auto mb-3 md:mb-4" />
                      <h3 className="text-lg md:text-xl font-semibold text-fitness-charcoal mb-2 md:mb-3">
                        Welcome to Fitness Knowledge
                      </h3>
                      <p className="text-gray-600 mb-3 md:mb-4">
                        Get answers from top fitness experts like AthleanX, Jeff Nippard, and Renaissance Periodization.
                      </p>
                      <p className="text-gray-600 text-xs md:text-sm mb-4 md:mb-5">
                        Ask any question about workouts, nutrition, or training techniques to get evidence-based answers from the best fitness YouTubers.
                      </p>
                      <Button
                        onClick={startNewChat}
                        className="bg-fitness-purple hover:bg-fitness-purple/90 mx-auto px-4 md:px-6"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Start New Chat
                      </Button>
                    </div>
                    
                    {/* Expert suggestions */}
                    <div className="mt-2 md:mt-4 w-full">
                      <h3 className="text-base md:text-lg font-semibold text-fitness-charcoal mb-3 md:mb-4">Ask our fitness experts</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 max-w-7xl mx-auto">
                        {expertSuggestions.map((expertGroup, groupIndex) => (
                          <div 
                            key={groupIndex} 
                            className="bg-white rounded-lg md:rounded-xl p-4 md:p-5 shadow-sm border border-gray-200 hover:border-fitness-purple/30 hover:shadow-md transition-all duration-300"
                          >
                            <h4 className="font-medium text-fitness-purple mb-2 md:mb-3 text-sm md:text-base">{expertGroup.expert}</h4>
                            <ul className="space-y-1 md:space-y-2">
                              {expertGroup.suggestions.map((suggestion, suggIndex) => (
                                <li key={suggIndex}>
                                  <button
                                    onClick={() => {
                                      startNewChat();
                                      // Small delay to ensure the new conversation is created before setting the input
                                      setTimeout(() => {
                                        handleSuggestionClick(suggestion);
                                      }, 50);
                                    }}
                                    className="text-left text-xs md:text-sm text-gray-700 hover:text-fitness-purple hover:underline w-full truncate transition-colors duration-300 py-1"
                                  >
                                    {suggestion}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
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
    </div>
  );
};

export default FitnessKnowledge; 