import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { publicErrorBody } from '../../../../lib/apiErrors';

const inputSchema = z.object({ expectedUserId: z.uuid() });
const json = (body: unknown, status = 200) => NextResponse.json(body, {
  status, headers: { 'Cache-Control': 'private, no-store' },
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const input = inputSchema.safeParse(await request.json().catch(() => null));
    if (!z.uuid().safeParse(id).success || !input.success) {
      return json({ error: 'Teklif veya oturum bilgisi geçersiz. Sayfayı yenileyin.' }, 400);
    }
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return json({ error: 'Oturum açmanız gerekiyor.' }, 401);
    if (user.id !== input.data.expectedUserId) {
      return json({ error: 'Açık hesap değişti. Teklifi yeni oturumunuzda tekrar inceleyin.' }, 409);
    }

    // Recovery is scoped to this exact quote and owner. The RPC remains the
    // authority for authorization, request locking and latest-version checks.
    const findJob = async () => await supabase.from('jobs').select('id')
      .eq('accepted_quote_id', id).eq('customer_id', user.id).maybeSingle();
    const existing = await findJob();
    if (existing.error) throw existing.error;
    if (existing.data) return json({ accepted: true, quoteId: id, jobId: existing.data.id });

    const { data, error } = await supabase.rpc('accept_quote', { p_quote_id: id });
    // A concurrent retry can lose the RPC race but still refer to the same job.
    const result = await findJob().catch(() => ({ data: null, error: true }));
    if (result.data) return json({ accepted: true, quoteId: id, jobId: result.data.id });
    if (error) {
      if (error.code === 'P0001') {
        return json({ error: 'Teklif artık kabul edilemiyor. Güncel teklifleri ve işlerinizi kontrol edin.', code: 'QUOTE_UNAVAILABLE' }, 409);
      }
      throw error;
    }
    // A failed follow-up read cannot undo an already committed acceptance.
    return json({ accepted: true, quoteId: id, quote: data, jobId: null });
  } catch (error) {
    const body = publicErrorBody(error, 'Kabul sonucu doğrulanamadı. Aynı teklifi yeniden deneyebilir veya işlerinizi kontrol edebilirsiniz.');
    return json(body, body.status);
  }
}
