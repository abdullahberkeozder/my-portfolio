import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import {jsonApiError,jsonPublicError} from '../../../lib/apiErrors';

export async function POST(request: Request) {
  if(request.headers.get('origin')!==new URL(request.url).origin)return jsonPublicError('INVALID_ORIGIN','İstek doğrulanamadı.',403);
  try {
    const supabase = await createSupabaseServerClient();
    const {error}=await supabase.auth.signOut({scope:'local'});
    if(error)return jsonApiError(error,'Oturum kapatılamadı. Yeniden deneyin.',502);

    const response = NextResponse.json({ success: true, redirect: '/giris' },{headers:{'Cache-Control':'no-store'}});
    // Clear simulated dev role cookie on sign out
    response.cookies.set('ankara_simulated_role', '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch(error) {
    return jsonApiError(error,'Çıkış yapılamadı.');
  }
}
