import { redirect } from 'next/navigation';

// /harita is a public-facing URL for the map view.
// Redirect to /ustalar with map view mode so the proper header/footer is shown
// and the page is crawlable by search engines.
export default function HaritaPage() {
  redirect('/ustalar?view=map');
}
