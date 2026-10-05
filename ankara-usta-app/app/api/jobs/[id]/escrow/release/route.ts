import { NextResponse } from 'next/server';
import { z } from 'zod';
import { assertJobIdentity, jobApiFailure, JobInputError } from '../../../../../lib/jobApiSafety';
import { createSupabaseServerClient } from '../../../../../lib/supabase/server';
import { jsonPublicError } from '../../../../../lib/apiErrors';

const releaseBodySchema = z.object({
  releaseReason: z.enum(['customer_acceptance', 'auto_release_72h', 'arbitration_award']),
  idempotencyKey: z.uuid(),
  note: z.string().trim().max(1000).optional(),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!z.uuid().safeParse(id).success) {
      throw new JobInputError('İş kimliği geçersiz.');
    }

    const payload = releaseBodySchema.parse(await request.json().catch(() => null));
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return jsonPublicError('AUTH_REQUIRED', 'Oturum açmanız gerekiyor.', 401);
    }

    assertJobIdentity(request, user.id);

    // Call transition_job RPC to transition job status to 'completed'
    // This atomically releases escrow, sets warranty_ends_at, and writes audit event.
    const { data: job, error: rpcError } = await supabase.rpc('transition_job', {
      p_job_id: id,
      p_status: 'completed',
    });

    if (rpcError) {
      throw rpcError;
    }

    return NextResponse.json(
      {
        escrowPayment: {
          id: payload.idempotencyKey,
          jobId: id,
          status: 'released_to_tradesperson',
          releaseReason: payload.releaseReason,
          note: payload.note ?? null,
          releasedAt: new Date().toISOString(),
          job,
        },
      },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (error) {
    return jobApiFailure(error);
  }
}
