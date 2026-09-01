import {NextResponse} from 'next/server';
import {createSupabaseServerClient} from '../../lib/supabase/server';
import {safeNextPath} from '../../lib/authRedirect';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = safeNextPath(url.searchParams.get('next')) ?? '/taleplerim';
  if (code) {
    const supabase = await createSupabaseServerClient();
    const {error} = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(new URL('/giris?authError=callback', url.origin));
}
