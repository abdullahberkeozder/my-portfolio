const jobLabels: Record<string, string> = {
  scheduled: 'Planlandı', inspection_scheduled: 'Keşif planlandı', in_progress: 'İş devam ediyor',
  awaiting_customer_approval: 'Onayınız bekleniyor', completed: 'Tamamlandı', disputed: 'Uyuşmazlık inceleniyor', cancelled: 'İptal edildi',
};
const roles: Record<string, string> = { customer: 'Müşteri', tradesperson: 'Usta', admin: 'Yönetici', moderator: 'İnceleme görevlisi' };
export const jobStatusLabel = (status: string) => jobLabels[status] ?? 'Durum güncelleniyor';
export const accountRoleLabel = (role: string) => roles[role] ?? 'Diğer rol';
