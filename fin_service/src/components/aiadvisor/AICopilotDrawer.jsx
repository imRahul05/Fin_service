import { useState, useEffect, useRef } from "react";
import { useFinances } from "../../hooks/useFinances";
import { askFinancialQuestion } from "../../services/AIService";
import { Sparkles, Mic, MicOff, Send, X, Bot, User, Loader2, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";

const SUGGESTED_QUESTIONS = [
  "How to save ₹25,000 in income tax under the Old vs New regime?",
  "Should I invest ₹10,000 extra in NPS or Nifty 50 Index SIP?",
  "Simulate prepaying ₹5,000 extra monthly on my home loan.",
  "What is my emergency fund runway and how do I reach 6 months?",
];

export default function AICopilotDrawer({ finances: propFinances = null }) {
  const { finances: hookFinances } = useFinances();
  const activeFinances = propFinances || hookFinances || {};

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "msg_init",
      sender: "bot",
      text: "Hello! I am your **FinSage AI Financial Copilot**. Ask me anything about tax saving, SIP allocations, loan prepayments, or Indian market strategies.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Setup Web Speech API for voice dictation
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-IN";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore abort errors
        }
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_voice_err_${Date.now()}`,
          sender: "bot",
          text: "⚠️ Voice recognition is not supported in this browser. Please type your query in the input box below.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSend = async (queryText = null) => {
    const textToSend = queryText || inputValue.trim();
    if (!textToSend || isLoading) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await askFinancialQuestion(textToSend, activeFinances, {
        userId: "copilot_user",
      });

      const botMessage = {
        id: `bot_${Date.now()}`,
        sender: "bot",
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Copilot error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          sender: "bot",
          text: "I encountered an error processing your query. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 sm:px-5 py-3 rounded-full bg-foreground text-background font-semibold text-xs shadow-card border border-border/80 hover:bg-foreground/90 transition-all cursor-pointer"
        title="Open Financial Advisor"
      >
        <Bot className="w-4 h-4" />
        <span className="hidden sm:inline">Ask Advisor</span>
      </button>

      {/* Slide-over Drawer Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-card border-l border-border/80 shadow-2xl flex flex-col">
              
              {/* Drawer Header */}
              <div className="p-4 border-b border-border/80 bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-2xl bg-foreground text-background shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      Financial Advisor
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Conversational strategy & modeling
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                  title="Close Advisor"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                  const isBot = msg.sender === "bot";
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${isBot ? "items-start" : "items-end justify-end"}`}
                    >
                      {isBot && (
                        <div className="w-7 h-7 rounded-full bg-muted text-foreground flex items-center justify-center shrink-0 mt-0.5 border border-border/60">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div
                        className={`group relative max-w-[85%] rounded-2xl p-3.5 text-xs shadow-xs ${
                          isBot
                            ? "bg-muted/40 text-foreground border border-border/60"
                            : "bg-foreground text-background rounded-br-none"
                        }`}
                      >
                        {isBot ? (
                          <div className="prose prose-xs dark:prose-invert max-w-none leading-relaxed">
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="font-medium whitespace-pre-wrap">{msg.text}</p>
                        )}

                        <div className="flex items-center justify-between mt-1.5 pt-1 text-[10px] text-muted-foreground">
                          <span>{msg.timestamp}</span>
                          {isBot && (
                            <button
                              onClick={() => handleCopy(msg.id, msg.text)}
                              className="opacity-0 group-hover:opacity-100 transition p-0.5 hover:text-foreground cursor-pointer"
                              title="Copy response"
                            >
                              {copiedId === msg.id ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {!isBot && (
                        <div className="w-7 h-7 rounded-full bg-muted text-foreground flex items-center justify-center shrink-0 border border-border/60">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
                    <Loader2 className="w-4 h-4 animate-spin text-foreground" />
                    <span>Analyzing your portfolio & computing models...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Action Chips */}
              <div className="p-3 border-t border-border/80 bg-muted/20">
                <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Suggested Questions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(q)}
                      className="text-[11px] text-left px-3 py-1.5 rounded-full bg-card hover:bg-muted border border-border/70 text-foreground transition line-clamp-1 cursor-pointer shadow-xs"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Box with Voice Mic */}
              <div className="p-3 border-t border-border/80 bg-card">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    className={`p-2.5 rounded-full border transition cursor-pointer ${
                      isListening
                        ? "bg-rose-500 text-white animate-pulse border-rose-600"
                        : "bg-muted text-muted-foreground border-border/80 hover:text-foreground hover:bg-muted/80"
                    }`}
                    title={isListening ? "Listening... click to stop" : "Voice input"}
                  >
                    {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>

                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={isListening ? "Listening to your voice..." : "Ask your financial question..."}
                    className="flex-1 px-4 py-2.5 text-xs rounded-full border border-border/80 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 placeholder:text-muted-foreground"
                  />

                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="p-2.5 rounded-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40 transition shadow-xs shrink-0 cursor-pointer"
                    title="Send query"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
