import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import {jsonApiError,jsonPublicError} from '../../../lib/apiErrors';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const {id} = await context.params;
    if (!z.uuid().safeParse(id).success)return jsonPublicError('INVALID_INPUT','Talep kimliği geçersiz.',400);
    const supabase = await createSupabaseServerClient();
    const {data:{user}} = await supabase.auth.getUser();
    if (!user)return jsonPublicError('AUTH_REQUIRED','Oturum açmanız gerekiyor.',401);
    const {data,error} = await supabase.from('service_requests')
      .select('*')
      .eq('id',id).eq('customer_id',user.id).eq('status','draft').single();
    if (error) throw error;
    return NextResponse.json({request:data});
  } catch (error) {
    return jsonApiError(error,'Taslak yüklenemedi.');
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!z.uuid().safeParse(id).success) {
      return jsonPublicError('INVALID_INPUT','Talep kimliği geçersiz.',400);
    }

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return jsonPublicError('AUTH_REQUIRED','Oturum açmanız gerekiyor.',401);
    }

    const { data: existing, error: readError } = await supabase
      .from('service_requests')
      .select('id,customer_id,status')
      .eq('id', id)
      .single();

    if (readError || !existing) {
      return jsonPublicError('NOT_FOUND','Talep bulunamadı.',404);
    }

    if (existing.customer_id !== user.id) {
      return jsonPublicError('FORBIDDEN','Bu işlem için yetkiniz yok.',403);
    }

    if (existing.status === 'draft') {
      const { error: deleteError } = await supabase
        .from('service_requests')
        .delete()
        .eq('id', id);
      if (deleteError) throw deleteError;
    } else {
      const { error: updateError } = await supabase
        .from('service_requests')
        .update({ status: 'cancelled' })
        .eq('id', id);
      if (updateError) throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonApiError(error,'Talep silinemedi.');
  }
}
