import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();

    const response = NextResponse.json({ success: true, redirect: '/giris' });
    // Clear simulated dev role cookie on sign out
    response.cookies.set('ankara_simulated_role', '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Çıkış yapılamadı.' },
      { status: 500 }
    );
  }
}
