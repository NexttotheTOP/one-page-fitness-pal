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
}

const ProfileQASection: React.FC<ProfileQASectionProps> = ({ userId, threadId, disabled }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setAnswer(null);
    if (!question.trim() || !userId || !threadId) return;
    setLoading(true);
    try {
      await queryFitnessCoach(threadId, question, (answer) => {
        setAnswer(answer);
      }, userId);
    } catch (err) {
      setError("Failed to get an answer. Please try again.");
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
          <div className="mt-2 p-5 bg-transparent border-gray-100 rounded-2xl text-fitness-charcoal text-[15px]">
            <span className="font-semibold text-fitness-purple">Answer:</span>
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