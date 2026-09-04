import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

export async function POST(request: Request) {
  if(request.headers.get('origin')!==new URL(request.url).origin)return NextResponse.json({error:'İstek doğrulanamadı.'},{status:403});
  try {
    const supabase = await createSupabaseServerClient();
    const {error}=await supabase.auth.signOut({scope:'local'});
    if(error)return NextResponse.json({error:'Oturum kapatılamadı. Yeniden deneyin.'},{status:502,headers:{'Cache-Control':'no-store'}});

    const response = NextResponse.json({ success: true, redirect: '/giris' },{headers:{'Cache-Control':'no-store'}});
    // Clear simulated dev role cookie on sign out
    response.cookies.set('ankara_simulated_role', '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Çıkış yapılamadı.' },
      { status: 500 }
    );
  }
}
