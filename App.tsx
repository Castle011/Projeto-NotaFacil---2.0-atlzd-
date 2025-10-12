import React, { useState, useMemo, useEffect } from 'react';
import Login from './components/Login';
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
import { Invoice, InvoiceStatus, Page } from './types';
import { LanguageProvider } from './context/LanguageContext';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'light');
  
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 'NF-001', clientName: 'Tech Solutions Inc.', amount: 2500, issueDate: '2023-10-15', dueDate: '2023-11-14', status: InvoiceStatus.Pago, observations: 'Serviços de consultoria em TI.' },
    { id: 'NF-002', clientName: 'Creative Minds Agency', amount: 1800, issueDate: '2023-10-20', dueDate: '2023-11-19', status: InvoiceStatus.Pendente, observations: 'Design de logotipo e material de marca.' },
    { id: 'NF-003', clientName: 'Global Exports Ltda.', amount: 5200, issueDate: '2023-09-05', dueDate: '2023-10-05', status: InvoiceStatus.Vencido, observations: 'Frete internacional.' },
    { id: 'NF-004', clientName: 'Padaria Pão Quente', amount: 350, issueDate: '2023-11-01', dueDate: '2023-12-01', status: InvoiceStatus.Pendente, observations: 'Fornecimento mensal de farinha.' },
    { id: 'NF-005', clientName: 'Tech Solutions Inc.', amount: 3100, issueDate: '2023-11-05', dueDate: '2023-12-05', status: InvoiceStatus.Pendente, observations: 'Desenvolvimento de módulo de e-commerce.' },
    { id: 'NF-006', clientName: 'Legal Advisors Assoc.', amount: 4500, issueDate: '2023-10-10', dueDate: '2023-11-09', status: InvoiceStatus.Pago, observations: 'Assessoria jurídica contratual.' },
  ]);

  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);
  
  const handleSetCurrentPage = (page: Page) => {
    setCurrentPage(page);
    setIsSidebarOpen(false); // Close sidebar on navigation
  };

  const addInvoice = (invoice: Omit<Invoice, 'id'>) => {
    const newId = `NF-${String(invoices.length + 1).padStart(3, '0')}`;
    setInvoices(prev => [{...invoice, id: newId}, ...prev]);
    setCurrentPage('dashboard');
  };
  
  const updateInvoice = (updatedInvoice: Invoice) => {
    setInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
    setEditingInvoice(null);
  };

  const deleteInvoice = (invoiceId: string) => {
    // Note: In a real app, you'd get the confirmation text from the translations.
    if (window.confirm('Tem certeza que deseja excluir esta nota fiscal? Esta ação não pode ser desfeita.')) {
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard invoices={invoices} />;
      case 'profile':
        return <ProfilePage userName={userName} invoices={invoices} />;
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
      default:
        return <Dashboard invoices={invoices} />;
    }
  };
  
  const userName = useMemo(() => "Usuário Admin", []);

  if (!isLoggedIn) {
    return (
      <LanguageProvider>
        <Login onLogin={handleLogin} />
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
      </div>
    </LanguageProvider>
  );
};

export default App;