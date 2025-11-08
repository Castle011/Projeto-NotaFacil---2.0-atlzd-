import React, { useState } from 'react';
import Chatbot from './Chatbot';
import { useTranslations } from '../context/LanguageContext';

const ChatbotPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslations();

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <>
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-50 transition-transform hover:scale-110"
        aria-label="Toggle chatbot"
      >
        {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.902L3 21l1.402-4.256A9.863 9.863 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[calc(100vw-3rem)] max-w-sm h-[60vh] max-h-[600px] bg-white dark:bg-slate-800 rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden">
          <header className="flex items-center justify-between p-4 bg-indigo-600 text-white">
            <h3 className="font-semibold">{t('chatbot.popupTitle')}</h3>
            <button onClick={toggleChat} aria-label="Close chatbot">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
          </header>
          <div className="flex-1 min-h-0">
             <Chatbot />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotPopup;
