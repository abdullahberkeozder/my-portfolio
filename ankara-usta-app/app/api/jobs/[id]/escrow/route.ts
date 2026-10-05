import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { jsonApiError, jsonPublicError } from '../../../../lib/apiErrors';
import { calculateEscrowAutoReleaseDeadline } from '../../../../domain';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!z.uuid().safeParse(id).success) {
      return jsonPublicError('INVALID_INPUT', 'Geçersiz iş kimliği.', 400);
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return jsonPublicError('AUTH_REQUIRED', 'Oturum açmanız gerekiyor.', 401);
    }

    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, status, customer_id, tradesperson_id, accepted_quote_id, warranty_ends_at, updated_at')
      .eq('id', id)
      .maybeSingle();

    if (jobError) throw jobError;
    if (!job) {
      return jsonPublicError('NOT_FOUND', 'İş kaydı bulunamadı.', 404);
    }

    // Role check: Only customer, tradesperson or admin can view escrow data
    const isParticipant =
      job.customer_id === user.id ||
      job.tradesperson_id === user.id;

    if (!isParticipant) {
      // Check if admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      if (profile?.role !== 'admin') {
        return jsonPublicError('FORBIDDEN', 'Bu işlem için yetkiniz yok.', 403);
      }
    }

    let laborAmountKurus = 0;
    let materialAmountKurus = 0;
    let warrantyDays = 30;

    if (job.accepted_quote_id) {
      const { data: quote } = await supabase
        .from('quotes')
        .select('labor_amount_kurus, material_amount_kurus, warranty_days')
        .eq('id', job.accepted_quote_id)
        .maybeSingle();

      if (quote) {
        laborAmountKurus = quote.labor_amount_kurus ?? 0;
        materialAmountKurus = quote.material_amount_kurus ?? 0;
        warrantyDays = quote.warranty_days ?? 30;
      }
    }

    // Map JobStatus to EscrowPaymentStatus
    let escrowStatus: 'authorized' | 'held_in_escrow' | 'released_to_tradesperson' | 'refunded' = 'held_in_escrow';
    if (job.status === 'scheduled' || job.status === 'inspection_scheduled') {
      escrowStatus = 'authorized';
    } else if (job.status === 'completed') {
      escrowStatus = 'released_to_tradesperson';
    } else if (job.status === 'cancelled') {
      escrowStatus = 'refunded';
    }

    let autoReleaseDeadline: string | null = null;
    if (job.status === 'awaiting_customer_approval') {
      const { data: deliveryEvents } = await supabase
        .from('job_events')
        .select('created_at')
        .eq('job_id', id)
        .eq('event_type', 'status_changed')
        .order('sequence', { ascending: false })
        .limit(1);

      const deliveryDateIso = deliveryEvents?.[0]?.created_at || job.updated_at || new Date().toISOString();
      autoReleaseDeadline = calculateEscrowAutoReleaseDeadline(deliveryDateIso);
    }

    return NextResponse.json(
      {
        escrow: {
          jobId: job.id,
          status: escrowStatus,
          laborAmountKurus,
          materialAmountKurus,
          totalAmountKurus: laborAmountKurus + materialAmountKurus,
          warrantyDays,
          autoReleaseDeadline,
          currency: 'TRY',
        },
      },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (error) {
    return jsonApiError(error, 'Emanet hesap bilgileri alınamadı.');
  }
}
