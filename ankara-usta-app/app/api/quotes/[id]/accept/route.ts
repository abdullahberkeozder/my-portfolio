import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import {jsonApiError,jsonPublicError} from '../../../../lib/apiErrors';

const inputSchema = z.object({ expectedUserId: z.uuid() });
const json = (body: unknown, status = 200) => NextResponse.json(body, {
  status, headers: { 'Cache-Control': 'private, no-store' },
});
const jobLookupDelaysMs = [0, 50, 150, 300] as const;

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const input = inputSchema.safeParse(await request.json().catch(() => null));
    if (!z.uuid().safeParse(id).success || !input.success) {
      return jsonPublicError('INVALID_INPUT','Teklif veya oturum bilgisi geçersiz. Sayfayı yenileyin.',400);
    }
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return jsonPublicError('AUTH_REQUIRED','Oturum açmanız gerekiyor.',401);
    if (user.id !== input.data.expectedUserId) {
      return jsonPublicError('ACCOUNT_CHANGED','Açık hesap değişti. Teklifi yeni oturumunuzda tekrar inceleyin.',409);
    }

    // Recovery is scoped to this exact quote and owner. The RPC remains the
    // authority for authorization, request locking and latest-version checks.
    const findJob = async () => await supabase.from('jobs').select('id')
      .eq('accepted_quote_id', id).eq('customer_id', user.id).maybeSingle();
    const findCommittedJob = async () => {
      let lastError: unknown = null;
      for (const delayMs of jobLookupDelaysMs) {
        if (delayMs > 0) await new Promise(resolve => setTimeout(resolve, delayMs));
        try {
          const result = await findJob();
          if (result.data) return result;
          if (result.error) lastError = result.error;
        } catch (error) {
          lastError = error;
        }
      }
      return { data: null, error: lastError };
    };
    const existing = await findJob();
    if (existing.error) throw existing.error;
    if (existing.data) return json({ accepted: true, quoteId: id, jobId: existing.data.id });

    const { data, error } = await supabase.rpc('accept_quote', { p_quote_id: id });
    // The RPC commits quote, request and job atomically. Realtime can refresh the
    // comparison surface before a follow-up Data API read observes that commit,
    // so resolve the exact quote-owned job inside a short, bounded window.
    const result = await findCommittedJob();
    if (result.data) return json({ accepted: true, quoteId: id, jobId: result.data.id });
    if (error) {
      if (error.code === 'P0001') {
        return jsonPublicError('QUOTE_UNAVAILABLE','Teklif artık kabul edilemiyor. Güncel teklifleri ve işlerinizi kontrol edin.',409);
      }
      throw error;
    }
    // A failed follow-up read cannot undo an already committed acceptance.
    return json({ accepted: true, quoteId: id, quote: data, jobId: null });
  } catch (error) {
    return jsonApiError(error,'Kabul sonucu doğrulanamadı. Aynı teklifi yeniden deneyebilir veya işlerinizi kontrol edebilirsiniz.');
  }
}
