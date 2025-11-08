import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabaseClient';
import Dashboard from './components/Dashboard';
import CreateInvoice from './components/CreateInvoice';
import About from './components/About';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import InvoicesPage from './components/InvoicesPage';
import EditInvoiceModal from './components/EditInvoiceModal';
import InvoiceDetailsModal from './components/InvoiceDetailsModal';
import CalendarPage from './components/CalendarPage';
import SettingsPage from './components/SettingsPage';
import ProfilePage from './components/ProfilePage';
import ChatbotPage from './components/ChatbotPage';
import ChatbotPopup from './components/ChatbotPopup';
import { Invoice, Page } from './types';
import { LanguageProvider } from './context/LanguageContext';
import { useInvoicesRealtime } from './hooks/useInvoicesRealtime';
import { createInvoiceSupabase, updateInvoiceSupabase, deleteInvoiceSupabase } from './services/supabaseService';
import Login from './components/Login';


const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'light');
  
  const { invoices, setInvoices } = useInvoicesRealtime();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
    });

    const {
        data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);


  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error logging out:', error);
  };
  
  const handleSetCurrentPage = (page: Page) => {
    setCurrentPage(page);
    setIsSidebarOpen(false); // Close sidebar on navigation
  };

  const addInvoice = async (invoice: Omit<Invoice, 'id'>) => {
    try {
        await createInvoiceSupabase(invoice);
        setCurrentPage('dashboard');
    } catch (error) {
        console.error("Failed to create invoice:", error);
        alert('Failed to create invoice. Please try again.');
    }
  };
  
  const updateInvoice = async (updatedInvoice: Invoice) => {
    const originalInvoices = [...invoices];
    // Optimistic update
    setInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
    setEditingInvoice(null);
    try {
        await updateInvoiceSupabase(updatedInvoice);
    } catch (error) {
        console.error("Failed to update invoice:", error);
        // Rollback
        setInvoices(originalInvoices);
        alert('Failed to update invoice. Please try again.');
    }
  };

  const deleteInvoice = async (invoiceId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta nota fiscal? Esta ação não pode ser desfeita.')) {
        const originalInvoices = [...invoices];
        // Optimistic update
        setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
        try {
            await deleteInvoiceSupabase(invoiceId);
        } catch (error) {
            console.error("Failed to delete invoice:", error);
            setInvoices(originalInvoices);
            alert('Failed to delete invoice. Please try again.');
        }
    }
  };

  const userName = session?.user?.user_metadata?.full_name || session?.user?.email || "Usuário";
  const userEmail = session?.user?.email;

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard invoices={invoices} />;
      case 'profile':
        return <ProfilePage userName={userName} userEmail={userEmail} invoices={invoices} />;
      case 'create-invoice':
        return <CreateInvoice addInvoice={addInvoice} />;
      case 'invoices':
        return <InvoicesPage 
          invoices={invoices}
          onEdit={setEditingInvoice}
          onDelete={deleteInvoice}
          onViewDetails={setViewingInvoice}
        />;
      case 'calendar':
        return <CalendarPage invoices={invoices} />;
      case 'settings':
        return <SettingsPage theme={theme} setTheme={setTheme} />;
      case 'about':
        return <About />;
      case 'chatbot':
        return <ChatbotPage />;
      default:
        return <Dashboard invoices={invoices} />;
    }
  };
  
  if (!session) {
    return (
      <LanguageProvider>
        <Login />
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <div className="relative min-h-screen lg:flex bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
        <Sidebar 
          currentPage={currentPage} 
          setCurrentPage={handleSetCurrentPage}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <Header 
            userName={userName} 
            onLogout={handleLogout}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
            {renderPage()}
          </main>
        </div>
        {editingInvoice && (
          <EditInvoiceModal
            invoice={editingInvoice}
            onSave={updateInvoice}
            onClose={() => setEditingInvoice(null)}
          />
        )}
        {viewingInvoice && (
          <InvoiceDetailsModal
            invoice={viewingInvoice}
            onClose={() => setViewingInvoice(null)}
          />
        )}
        <ChatbotPopup />
      </div>
    </LanguageProvider>
  );
};

export default App;