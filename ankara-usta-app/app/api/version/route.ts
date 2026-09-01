import {NextResponse} from 'next/server';

export function GET(){
  return NextResponse.json({
    commit:process.env.VERCEL_GIT_COMMIT_SHA??process.env.GITHUB_SHA??'local-working-tree',
    environment:process.env.VERCEL_ENV??process.env.NODE_ENV??'development',
    builtAt:process.env.BUILD_TIMESTAMP??null,
  },{headers:{'Cache-Control':'public, max-age=300, stale-while-revalidate=3600'}});
}
