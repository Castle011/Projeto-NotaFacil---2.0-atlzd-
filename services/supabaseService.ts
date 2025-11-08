import { supabase } from '../lib/supabaseClient';
import { Invoice } from '../types';

// Simple UUID v4 generator for broader browser compatibility.
export const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

export async function createInvoiceSupabase(invoice: Invoice) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const errorMsg = 'User is not authenticated. Cannot create invoice.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  
  const { error } = await supabase.from('invoices').insert([
    {
      id: invoice.id,
      user_id: user.id,
      client_name: invoice.clientName,
      amount: invoice.amount,
      issue_date: invoice.issueDate,
      due_date: invoice.dueDate,
      status: invoice.status,
      observations: invoice.observations,
    },
  ]);
  if (error) {
    console.error('Error creating invoice in Supabase:', error);
    throw error;
  }
}

export async function updateInvoiceSupabase(invoice: Invoice) {
  const { error } = await supabase.from('invoices').update({
    client_name: invoice.clientName,
    amount: invoice.amount,
    issue_date: invoice.issueDate,
    due_date: invoice.dueDate,
    status: invoice.status,
    observations: invoice.observations,
  }).eq('id', invoice.id);
  if (error) {
    console.error('Error updating invoice in Supabase:', error);
    throw error;
  }
}

export async function deleteInvoiceSupabase(id: string) {
  const { error } = await supabase.from('invoices').delete().eq('id', id);
  if (error) {
    console.error('Error deleting invoice in Supabase:', error);
    throw error;
  }
}