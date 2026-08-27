import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';

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
    if (!user) return NextResponse.json({error: 'Oturum açmanız gerekiyor.'}, {status: 401});
    if (!payload.storagePath.startsWith(`${user.id}/${id}/`)) {
      return NextResponse.json({error: 'Medya yolu geçersiz.'}, {status: 403});
    }

    const {data, error} = await supabase.from('request_media').insert({
      request_id: id,
      customer_id: user.id,
      storage_path: payload.storagePath,
      content_type: payload.contentType,
      byte_size: payload.byteSize,
    }).select('id').single();
    if (error) throw error;
    return NextResponse.json({media: data});
  } catch (error) {
    return NextResponse.json({error: error instanceof Error ? error.message : 'Medya kaydedilemedi.'}, {status: 400});
  }
}
