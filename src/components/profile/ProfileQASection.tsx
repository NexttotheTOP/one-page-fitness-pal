import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send } from "lucide-react";
import { cn } from '@/lib/utils';
import { queryFitnessCoach } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ProfileQASectionProps {
  userId?: string;
  threadId?: string;
  disabled?: boolean;
  minimal?: boolean;
  prominent?: boolean;
}

const ProfileQASection: React.FC<ProfileQASectionProps> = ({ userId, threadId, disabled, minimal, prominent }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setAnswer(null);
    if (!question.trim() || !userId || !threadId) return;
    setLoading(true);
    setThinking(true);
    try {
      await queryFitnessCoach(threadId, question, (answer) => {
        setAnswer(answer);
        setThinking(false);
      }, userId);
    } catch (err) {
      setError("Failed to get an answer. Please try again.");
      setThinking(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading && question.trim()) handleSubmit();
    }
  };

  if (minimal && prominent) {
    const hasText = question.trim().length > 0;
    return (
      <>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2">
          <div
            className={cn(
              "flex items-center w-full border border-fitness-purple/30 shadow-sm rounded-xl px-4 py-2 gap-3 transition-colors",
              hasText
                ? "bg-white"
                : "bg-gradient-to-r from-fitness-purple/10 to-blue-100"
            )}
          >
            <Send className="h-5 w-5 text-fitness-purple/80" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask a question about this overview..."
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled || !userId || !threadId || loading}
              className="flex-1 bg-transparent border-0 outline-none focus:ring-0 h-12 px-0 text-base text-fitness-charcoal placeholder:text-gray-400"
              style={{ minWidth: 0 }}
            />
            <button
              type="submit"
              disabled={disabled || !userId || !threadId || loading || !question.trim()}
              className="ml-2 p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-fitness-purple/10"
              tabIndex={-1}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-fitness-purple" />
              ) : (
                <Send className={cn(
                  "h-5 w-5 transition-transform",
                  question.trim() !== '' ? "text-fitness-purple" : "text-gray-400"
                )} />
              )}
            </button>
          </div>
          {thinking && !answer && (
            <div className="text-xs text-muted-foreground mt-1 flex items-center">
              <Loader2 className="h-3 w-3 animate-spin mr-2" />
              Thinking...
            </div>
          )}
          {loading && !thinking && (
            <div className="text-xs text-muted-foreground mt-1 flex items-center">
              <Loader2 className="h-3 w-3 animate-spin mr-2" />
              Answering your question...
            </div>
          )}
          {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
          {answer && (
            <div className="mt-2 bg-gradient-to-br from-fitness-purple/10 to-blue-50 rounded-xl shadow-sm border border-gray-100 p-4 text-fitness-charcoal text-[15px]">
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
                {answer}
              </ReactMarkdown>
            </div>
          )}
        </form>
        {!answer && (
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <svg className="h-4 w-4 text-fitness-purple" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
            <span>Ask any question about the selected fitness profile overview.</span>
          </div>
        )}
      </>
    );
  }

  if (minimal) {
    return (
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2">
        <div className="flex items-center w-full border-b border-gray-200 focus-within:border-fitness-purple transition-colors">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask a question about your fitness profile..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || !userId || !threadId || loading}
            className="flex-1 bg-transparent border-0 outline-none focus:ring-0 h-12 px-0 text-base text-fitness-charcoal placeholder:text-gray-400"
            style={{ minWidth: 0 }}
          />
          <button
            type="submit"
            disabled={disabled || !userId || !threadId || loading || !question.trim()}
            className="ml-2 p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-fitness-purple/10"
            tabIndex={-1}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-fitness-purple" />
            ) : (
              <Send className={cn(
                "h-5 w-5 transition-transform",
                question.trim() !== '' ? "text-fitness-purple" : "text-gray-400"
              )} />
            )}
          </button>
        </div>
        {loading && (
          <div className="text-xs text-muted-foreground mt-1 flex items-center">
            <Loader2 className="h-3 w-3 animate-spin mr-2" />
            Answering your question...
          </div>
        )}
        {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
        {answer && (
          <div className="mt-2 bg-gradient-to-br from-fitness-purple/10 to-blue-50 rounded-xl shadow-sm border border-gray-100 p-4 text-fitness-charcoal text-[15px]">
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
              {answer}
            </ReactMarkdown>
          </div>
        )}
      </form>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative flex items-center rounded-2xl overflow-hidden transition-all duration-300 shadow-sm bg-gradient-to-r from-blue-50 to-purple-50 group">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-full bg-gradient-to-b from-fitness-purple to-blue-400 transition-all duration-300" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Ask a question about your fitness profile..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || !userId || !threadId || loading}
            className={cn(
              "flex-1 border-0 focus-visible:ring-0 h-14 pl-6 pr-24 bg-transparent transition-all text-base text-fitness-charcoal placeholder:text-gray-400",
              loading ? "text-fitness-charcoal/90" : "text-fitness-charcoal"
            )}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {question.trim().length > 0 && !loading && (
              <div className="text-xs text-muted-foreground animate-fadeIn mr-1">Press Enter ↵</div>
            )}
            <Button
              type="submit"
              disabled={disabled || !userId || !threadId || loading || !question.trim()}
              className={cn(
                "rounded-xl h-11 w-11 p-0 transition-all duration-300 relative group/button",
                loading
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-gradient-to-br from-fitness-purple to-purple-500 hover:from-fitness-purple/90 hover:to-purple-500/90 text-white shadow-sm"
              )}
            >
              {loading ? (
                <div className="flex items-center justify-center animate-spin">
                  <Loader2 className="h-5 w-5" />
                </div>
              ) : (
                <>
                  <div className="bg-gradient-to-br from-white/20 to-transparent absolute inset-0 opacity-0 group-hover/button:opacity-100 transition-opacity rounded-xl"></div>
                  <Send className={cn(
                    "h-5 w-5 transition-transform group-hover/button:scale-110",
                    question.trim() !== '' ? "text-white" : "text-gray-400"
                  )} />
                </>
              )}
            </Button>
          </div>
        </div>
        {loading && (
          <div className="text-xs text-muted-foreground mt-2 ml-3 animate-fadeIn flex items-center">
            <div className="mr-2 flex items-center space-x-1">
              <div className="h-1.5 w-1.5 bg-fitness-purple rounded-full animate-pulse"></div>
              <div className="h-1.5 w-1.5 bg-fitness-purple rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="h-1.5 w-1.5 bg-fitness-purple rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            Answering your question...
          </div>
        )}
        {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
        {answer && (
          <div className="mt-2 bg-gradient-to-br from-fitness-purple/10 to-blue-50 rounded-xl shadow-sm border border-gray-100 p-4 text-fitness-charcoal text-[15px]">
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
              {answer}
            </ReactMarkdown>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileQASection; 