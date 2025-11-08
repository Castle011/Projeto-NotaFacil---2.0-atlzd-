import React from 'react';
import Chatbot from './Chatbot';
import { useTranslations } from '../context/LanguageContext';

const ChatbotPage: React.FC = () => {
    const { t } = useTranslations();
    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm h-[calc(100vh-8rem)] flex flex-col">
            <header className="p-4 border-b border-slate-200 dark:border-slate-700">
                 <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{t('chatbot.pageTitle')}</h2>
            </header>
            <div className="flex-1 min-h-0">
                 <Chatbot />
            </div>
        </div>
    );
}

export default ChatbotPage;
