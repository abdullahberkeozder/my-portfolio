import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import {jsonApiError,jsonPublicError} from '../../../../lib/apiErrors';

const mediaSchema = z.object({
  storagePath: z.string().trim().min(1).max(500),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'video/mp4']),
  byteSize: z.number().int().positive().max(52_428_800),
});

export async function POST(request: Request, context: {params: Promise<{id: string}>}) {
  try {
    const {id} = await context.params;
    const payload = mediaSchema.parse(await request.json());
    const supabase = await createSupabaseServerClient();
    const {data: {user}} = await supabase.auth.getUser();
    if (!user) return jsonPublicError('AUTH_REQUIRED','Oturum açmanız gerekiyor.',401);
    if (!payload.storagePath.startsWith(`${user.id}/${id}/`)) {
      return jsonPublicError('INVALID_MEDIA_PATH','Medya yolu geçersiz.',403);
    }

    const {data, error} = await supabase.from('request_media').upsert({
      request_id: id,
      customer_id: user.id,
      storage_path: payload.storagePath,
      content_type: payload.contentType,
      byte_size: payload.byteSize,
    }, {onConflict: 'storage_path', ignoreDuplicates: false}).select('id').single();
    if (error) throw error;
    return NextResponse.json({media: data});
  } catch (error) {
    if(error instanceof z.ZodError||error instanceof SyntaxError)return jsonPublicError('INVALID_INPUT','Medya bilgilerini kontrol edin.',400);
    return jsonApiError(error,'Medya kaydı tamamlanamadı.');
  }
}
