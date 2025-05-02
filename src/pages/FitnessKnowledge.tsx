import { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import { Send, Trash2, Brain, Plus, MessageSquare, CornerRightDown, Search, ArrowLeft, ChevronRight } from 'lucide-react';
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

  // Format date for conversation list
  const formatConversationDate = (date: Date) => {
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
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="w-full py-6 flex-1 flex flex-col">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-160px)] px-2 md:px-6 xl:px-8">
          {/* Left sidebar - Conversation history */}
          <div className={cn(
            "col-span-12 md:col-span-3 lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 h-full",
            showConversationsList ? "block" : "hidden md:block"
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
                    <ArrowLeft className="h-4 w-4" />
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
          
          {/* Main chat area */}
          <div className="col-span-12 md:col-span-9 lg:col-span-10 flex flex-col h-full">
            {/* Header with title and controls */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowConversationsList(true)}
                  className="mr-2 md:hidden h-9 w-9 rounded-full hover:bg-gray-100"
                >
                  <MessageSquare className="h-5 w-5 text-fitness-purple" />
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
            <div className="flex-1 flex flex-col h-full">
              {activeConversation ? (
                /* Active chat with messages */
                <div className="flex-1 flex flex-col relative">
                  <Card className="flex-1 overflow-hidden border-0 shadow-sm rounded-xl mb-4 bg-gradient-to-b from-white to-gray-50/50">
                    <ScrollArea className="flex-1 h-full" ref={scrollAreaRef}>
                      <div className="space-y-6 px-4 py-4">
                        <AnimatePresence initial={false}>
                          {activeConversation.messages.map((message, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                              className={`flex ${
                                message.role === 'user' ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div className="flex items-start max-w-[85%] gap-2">
                                {message.role === 'assistant' && (
                                  <Avatar className="h-8 w-8 mt-1">
                                    <AvatarFallback className="bg-fitness-purple text-white">AI</AvatarFallback>
                                  </Avatar>
                                )}
                                
                                <div
                                  className={cn(
                                    "rounded-2xl p-4",
                                    message.role === 'user'
                                      ? "bg-gradient-to-br from-fitness-purple to-fitness-purple/90 text-white shadow-sm"
                                      : "bg-white border border-gray-100 shadow-sm text-gray-800"
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
                                              className={cn(
                                                "hover:underline",
                                                message.role === 'user' ? "text-blue-200" : "text-blue-600"
                                              )}
                                            >
                                              {children}
                                            </a>
                                          ),
                                          code: ({ children }) => (
                                            <code 
                                              className={cn(
                                                "px-1 py-0.5 rounded text-sm",
                                                message.role === 'user' 
                                                  ? "bg-white/20 text-white" 
                                                  : "bg-gray-100 text-red-500"
                                              )}
                                            >
                                              {children}
                                            </code>
                                          ),
                                          pre: ({ children }) => (
                                            <pre 
                                              className={cn(
                                                "p-2 rounded-md overflow-x-auto my-2 text-sm",
                                                message.role === 'user' 
                                                  ? "bg-white/10" 
                                                  : "bg-gray-100"
                                              )}
                                            >
                                              {children}
                                            </pre>
                                          )
                                        }}
                                      >
                                        {message.content}
                                      </ReactMarkdown>
                                      <div className="text-xs opacity-70 mt-2 text-right">
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
                                
                                {message.role === 'user' && (
                                  <Avatar className="h-8 w-8 mt-1">
                                    <AvatarFallback className="bg-gray-200 text-fitness-charcoal">{displayName.substring(0, 2)}</AvatarFallback>
                                  </Avatar>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </ScrollArea>
                  </Card>
                  
                  {/* Input area */}
                  <div className="flex space-x-2 mb-2">
                    <div className="relative flex-1">
                      <div className={cn(
                        "group relative flex items-center rounded-full overflow-hidden transition-all duration-300 shadow-sm",
                        isProcessing 
                          ? "bg-gradient-to-r from-purple-50 to-blue-50 shadow-md" 
                          : "bg-white hover:shadow-md"
                      )}>
                        <div className={cn(
                          "absolute left-0 top-0 bottom-0 w-[3px] rounded-l-full transition-all duration-300",
                          isProcessing 
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
                            "flex-1 border-0 focus-visible:ring-0 h-12 pl-4 pr-20 bg-transparent transition-all",
                            isProcessing ? "text-fitness-charcoal/90" : "text-fitness-charcoal",
                          )}
                        />
                        
                        <div className="absolute right-1 top-1 flex items-center gap-2">
                          {inputValue.trim().length > 0 && !isProcessing && (
                            <div className="text-xs text-muted-foreground animate-fadeIn mr-1">
                              Press Enter ↵
                            </div>
                          )}
                          
                          <Button 
                            onClick={handleSendMessage} 
                            disabled={isProcessing || inputValue.trim() === ''}
                            className={cn(
                              "rounded-full h-10 w-10 p-0 transition-all duration-300 relative group/button",
                              isProcessing 
                                ? "bg-gray-200 cursor-not-allowed" 
                                : inputValue.trim() === ''
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-gradient-to-r from-fitness-purple to-purple-500 hover:from-fitness-purple/90 hover:to-purple-500/90 text-white shadow-sm"
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
                                <Send className="h-4 w-4 transition-transform group-hover/button:scale-110" />
                                <span className="absolute inset-0 rounded-full bg-white opacity-0 group-hover/button:opacity-10 transition-opacity"></span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      {isProcessing && (
                        <div className="text-xs text-muted-foreground mt-1.5 ml-3 animate-fadeIn flex items-center">
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
                <div className="flex-1 flex flex-col items-center justify-center max-w-full py-4 md:py-0">
                  <div className="text-center animate-fadeIn w-full mx-auto px-2">
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
    </div>
  );
};

export default FitnessKnowledge; 