export const ADMIN_ROLES = ["owner", "admin", "operator", "technician"];

export const ROLE_LABELS = {
  owner: "İşletme sahibi",
  admin: "Yönetici",
  operator: "Randevu sorumlusu",
  technician: "Usta",
};

export const ROLE_DESCRIPTIONS = {
  owner: "Ekip, yetkiler ve bütün operasyon üzerinde tam yetki.",
  admin: "Randevu, müsaitlik ve operasyon yönetimi.",
  operator: "Randevu talepleri, müşteri iletişimi ve takvim yönetimi.",
  technician: "Kendisine atanacak işleri görüntülemeye hazır saha rolü.",
};

export const STATUS_LABELS = {
  pending: "Onay bekliyor",
  active: "Aktif",
  suspended: "Askıya alındı",
  rejected: "Ekipten çıkarıldı",
};

export const ROUTE_ROLES = {
  dashboard: ADMIN_ROLES,
  bookings: ["owner", "admin", "operator"],
  availability: ["owner", "admin", "operator"],
  users: ["owner"],
};

export function isActiveTeamMember(profile) {
  return (
    Boolean(profile) &&
    profile.status === "active" &&
    ADMIN_ROLES.includes(profile.role)
  );
}

export function hasAllowedRole(profile, allowedRoles = ADMIN_ROLES) {
  return isActiveTeamMember(profile) && allowedRoles.includes(profile.role);
}
