export const APPOINTMENT_ATTACHMENT_LIMITS = Object.freeze({
  maxCount: 3,
  maxSize: 5 * 1024 * 1024,
  acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
});

export function formatAttachmentSize(bytes) {
  if (!Number.isFinite(bytes)) return "";
  return `${(bytes / (1024 * 1024)).toLocaleString("tr-TR", {
    maximumFractionDigits: 1,
  })} MB`;
}

export function validateAppointmentAttachments(files, currentCount = 0) {
  const availableCount = Math.max(
    0,
    APPOINTMENT_ATTACHMENT_LIMITS.maxCount - currentCount,
  );
  const accepted = [];
  const errors = [];

  Array.from(files || []).forEach((file) => {
    if (accepted.length >= availableCount) {
      errors.push("En fazla 3 fotoğraf ekleyebilirsiniz.");
      return;
    }

    if (!APPOINTMENT_ATTACHMENT_LIMITS.acceptedTypes.includes(file.type)) {
      errors.push(`${file.name}: Yalnızca JPEG, PNG veya WebP yüklenebilir.`);
      return;
    }

    if (file.size > APPOINTMENT_ATTACHMENT_LIMITS.maxSize) {
      errors.push(`${file.name}: Dosya boyutu 5 MB'dan küçük olmalıdır.`);
      return;
    }

    accepted.push(file);
  });

  return { accepted, errors: [...new Set(errors)] };
}

