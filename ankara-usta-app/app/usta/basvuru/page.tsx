import { redirect } from 'next/navigation';

// Legacy redirect alias: /usta/basvuru -> /usta-basvurusu
export default function UstaBasvuruRedirectPage() {
  redirect('/usta-basvurusu');
}
