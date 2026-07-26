import { describe, expect, it } from "vitest";

import {
  APPOINTMENT_ATTACHMENT_LIMITS,
  formatAttachmentSize,
  validateAppointmentAttachments,
} from "./appointmentAttachments";

function image(name, type = "image/jpeg", size = 1024) {
  return new File([new Uint8Array(size)], name, { type });
}

describe("appointment attachment validation", () => {
  it("accepts up to three supported images", () => {
    const files = [
      image("one.jpg"),
      image("two.png", "image/png"),
      image("three.webp", "image/webp"),
    ];

    expect(validateAppointmentAttachments(files)).toEqual({
      accepted: files,
      errors: [],
    });
  });

  it("rejects unsupported and oversized files", () => {
    const result = validateAppointmentAttachments([
      image("document.pdf", "application/pdf"),
      image(
        "large.jpg",
        "image/jpeg",
        APPOINTMENT_ATTACHMENT_LIMITS.maxSize + 1,
      ),
    ]);

    expect(result.accepted).toHaveLength(0);
    expect(result.errors.join(" ")).toContain("JPEG, PNG veya WebP");
    expect(result.errors.join(" ")).toContain("5 MB");
  });

  it("respects the remaining attachment count", () => {
    const result = validateAppointmentAttachments(
      [image("two.jpg"), image("three.jpg")],
      2,
    );

    expect(result.accepted).toHaveLength(1);
    expect(result.errors).toContain("En fazla 3 fotoğraf ekleyebilirsiniz.");
  });

  it("formats megabytes for the Turkish interface", () => {
    expect(formatAttachmentSize(1.5 * 1024 * 1024)).toBe("1,5 MB");
  });
});

