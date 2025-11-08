import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Invoice, InvoiceStatus } from '../types';

export function useInvoicesRealtime() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    let mounted = true;

    const mapRow = (r: any): Invoice => ({
      id: r.id,
      clientName: r.client_name,
      amount: Number(r.amount),
      issueDate: r.issue_date,
      dueDate: r.due_date || new Date().toISOString().split('T')[0], // Default if null
      status: r.status as InvoiceStatus,
      observations: r.observations || '', // Default if null
    });

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (mounted) setInvoices([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data && mounted) setInvoices(data.map(mapRow));
    };

    load();

    const channel = supabase
      .channel('public:invoices')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invoices' },
        (payload) => {
          if (!mounted) return;
          const rec = payload.new ?? payload.old;
          if (!rec) return;

          setInvoices((prev) => {
            const newInvoice = mapRow(rec);
            const exists = prev.some(inv => inv.id === newInvoice.id);

            switch (payload.eventType) {
              case 'INSERT':
                return exists ? prev.map(inv => inv.id === newInvoice.id ? newInvoice : inv) : [newInvoice, ...prev];
              case 'UPDATE':
                return prev.map((inv) => (inv.id === newInvoice.id ? newInvoice : inv));
              case 'DELETE':
                return prev.filter((inv) => inv.id !== rec.id);
              default:
                return prev;
            }
          });
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { invoices, setInvoices };
}