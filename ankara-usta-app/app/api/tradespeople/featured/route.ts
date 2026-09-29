import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { jsonApiError } from '../../../lib/apiErrors';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc('list_public_verified_professionals', {
      p_service_id: null,
      p_district: null,
      p_offset: 0,
      p_limit: 6,
    });

    if (error) {
      // In pilot or test environments where RPC might be unavailable or unseeded,
      // fail safely with empty verified list (TRUST-01: hasSyntheticArtisans: false)
      return NextResponse.json({
        professionals: [],
        totalCount: 0,
        hasSyntheticArtisans: false,
        pilotStatus: 'onboarding',
      });
    }

    const professionals = (data ?? []).map((row: { user_id: string; display_name: string; bio: string | null; city: string | null }) => ({
      userId: row.user_id,
      displayName: row.display_name,
      bio: row.bio,
      city: row.city,
    }));

    return NextResponse.json(
      {
        professionals,
        totalCount: data?.[0]?.total_count ?? professionals.length,
        hasSyntheticArtisans: false,
        pilotStatus: professionals.length > 0 ? 'active' : 'onboarding',
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    return jsonApiError(error, 'featured_tradespeople');
  }
}
