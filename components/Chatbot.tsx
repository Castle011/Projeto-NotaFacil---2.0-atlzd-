import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { useTranslations } from '../context/LanguageContext';
import { Invoice, InvoiceStatus, Message } from '../types';

interface ChatbotProps {
  invoices: Invoice[];
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const apiKey = "AIzaSyA-99JUXLSc2vJ0CnkmMDt2bj6beYuxoBI";

const Chatbot: React.FC<ChatbotProps> = ({ invoices, messages, setMessages }) => {
  const { t } = useTranslations();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // A new chat session is started when the message list is empty.
    const isNewChat = messages.length === 0;

    if (isNewChat) {
      setError(null); // Clear previous errors on new chat
      if (!apiKey) {
        console.warn("API_KEY not found. Chatbot will be disabled.");
        setError(t('chatbot.apiKeyMissing'));
        setMessages([{ role: 'model', text: t('chatbot.apiKeyMissing') }]);
        return;
      }
      
      const ai = new GoogleGenAI({ apiKey });
      chatRef.current = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: `You are a helpful assistant for an invoice management app called NotaFácil.
Your purpose is to help users understand their invoice data.
Use the context provided about the user's invoices to answer their questions.
Refer to clients by their names, and mention specific invoice amounts and statuses.
Be concise, friendly, and professional.
The application is available in Portuguese (pt) and English (en), respond in the user's language.`,
        },
      });
      setMessages([{ role: 'model', text: t('chatbot.welcomeMessage') }]);
    }
  }, [messages, setMessages, t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatRef.current) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Create a detailed summary of invoice data.
      const clientNames = [...new Set(invoices.map(inv => inv.clientName))].join(', ') || 'nenhum cliente';
      
      const pendingInvoices = invoices.filter(inv => inv.status === InvoiceStatus.Pendente);
      const pendingSummary = pendingInvoices.length > 0
        ? pendingInvoices.map(inv => `${inv.clientName} (R$ ${inv.amount.toFixed(2)})`).join(', ')
        : 'nenhuma';
        
      const overdueInvoices = invoices.filter(inv => inv.status === InvoiceStatus.Vencido);
      const overdueSummary = overdueInvoices.length > 0
        ? overdueInvoices.map(inv => `${inv.clientName} (R$ ${inv.amount.toFixed(2)})`).join(', ')
        : 'nenhuma';

      const invoiceContext = `
        Here is a summary of the user's current invoices for context:
        - Total invoices: ${invoices.length}
        - Client names: ${clientNames}.
        - Pending invoices (${pendingInvoices.length}): ${pendingSummary}.
        - Overdue invoices (${overdueInvoices.length}): ${overdueSummary}.
        - Total amount billed: R$ ${invoices.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}
      `.trim().replace(/ +/g, ' '); // Clean up whitespace

      const contextualInput = `${invoiceContext}\n\n---\n\nUser question: "${input}"`;

      const responseStream = await chatRef.current.sendMessageStream({ message: contextualInput });
      
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of responseStream) {
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.role === 'model') {
            const updatedMessages = [...prev];
            updatedMessages[prev.length - 1] = { ...lastMessage, text: lastMessage.text + chunk.text };
            return updatedMessages;
          }
          return prev;
        });
      }
    } catch (err) {
      console.error("Chatbot error:", err);
      setError(t('chatbot.errorMessage'));
      setMessages(prev => [...prev, { role: 'model', text: t('chatbot.errorMessage')}]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
                msg.role === 'user' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm'
            }`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                 <div className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-700">
                    <div className="flex items-center space-x-1">
                        <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && <p className="px-4 text-sm text-red-500">{error}</p>}
      
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chatbot.inputPlaceholder')}
            disabled={isLoading || !!error}
            className="flex-1 w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="submit" disabled={isLoading || !input.trim() || !!error} className="bg-indigo-600 text-white rounded-full p-2.5 hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 16.51l.906.259 1.956 5.585a1 1 0 001.788 0l7-14a1 1 0 00-1.169-1.409l-5 1.428A1 1 0 0011 3.49l-.906-.259L8.138 7.646a1 1 0 00-.545-.545L1.956 5.145a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 003 16.51l.906.259 1.956 5.585a1 1 0 001.788 0l7-14a1 1 0 00-1.169-1.409l-5 1.428A1 1 0 0011 3.49l-.906-.259L8.138 7.646a1 1 0 00-.545-.545L1.956 5.145z" transform="rotate(45 10 10)" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;