export enum InvoiceStatus {
  Pago = 'Pago',
  Pendente = 'Pendente',
  Vencido = 'Vencido',
}

export interface Invoice {
  id: string;
  clientName: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  observations: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export type Page = 'dashboard' | 'profile' | 'create-invoice' | 'invoices' | 'about' | 'calendar' | 'settings' | 'chatbot';