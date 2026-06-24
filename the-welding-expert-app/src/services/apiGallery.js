import supabase from "./supabase";

const TABLE = "gallery_items";
const BUCKET = "gallery";
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function getGalleryItems({ publishedOnly = false } = {}) {
  let query = supabase
    .from(TABLE)
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (publishedOnly) query = query.eq("is_published", true);

  const { data, error } = await query;

  if (error) {
    console.error(error);
    throw new Error("Galeri öğeleri yüklenemedi.");
  }

  return data;
}

export async function getGalleryItem(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    throw new Error("Galeri öğesi bulunamadı.");
  }

  return data;
}

export async function createGalleryItem({
  item,
  mainImageFile,
  beforeImageFile,
}) {
  const uploadedUrls = [];

  try {
    const imageUrl = await uploadGalleryImage(mainImageFile);
    uploadedUrls.push(imageUrl);

    let beforeImageUrl = null;
    if (beforeImageFile) {
      beforeImageUrl = await uploadGalleryImage(beforeImageFile);
      uploadedUrls.push(beforeImageUrl);
    }

    const { data, error } = await supabase
      .from(TABLE)
      .insert([
        {
          ...item,
          image_url: imageUrl,
          before_image_url: beforeImageUrl,
        },
      ])
      .select("*")
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    await deleteGalleryImagesByUrl(uploadedUrls);
    console.error(error);
    throw new Error(
      error.message?.includes("Görsel")
        ? error.message
        : "Galeri öğesi oluşturulamadı.",
    );
  }
}

export async function updateGalleryItem({
  id,
  updates,
  currentItem,
  mainImageFile,
  beforeImageFile,
  removeBeforeImage = false,
}) {
  const uploadedUrls = [];
  const replacedUrls = [];

  try {
    const nextUpdates = { ...updates };

    if (mainImageFile) {
      nextUpdates.image_url = await uploadGalleryImage(mainImageFile);
      uploadedUrls.push(nextUpdates.image_url);
      if (currentItem?.image_url) replacedUrls.push(currentItem.image_url);
    }

    if (beforeImageFile) {
      nextUpdates.before_image_url = await uploadGalleryImage(beforeImageFile);
      uploadedUrls.push(nextUpdates.before_image_url);
      if (currentItem?.before_image_url) {
        replacedUrls.push(currentItem.before_image_url);
      }
    } else if (removeBeforeImage) {
      nextUpdates.before_image_url = null;
      if (currentItem?.before_image_url) {
        replacedUrls.push(currentItem.before_image_url);
      }
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update(nextUpdates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    await deleteGalleryImagesByUrl(replacedUrls);
    return data;
  } catch (error) {
    await deleteGalleryImagesByUrl(uploadedUrls);
    console.error(error);
    throw new Error(
      error.message?.includes("Görsel")
        ? error.message
        : "Galeri öğesi güncellenemedi.",
    );
  }
}

export async function deleteGalleryItem(id) {
  const item = await getGalleryItem(id);
  const { error } = await supabase.from(TABLE).delete().eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Galeri öğesi silinemedi.");
  }

  await deleteGalleryImagesByUrl([item.image_url, item.before_image_url]);
  return true;
}

export async function uploadGalleryImage(file) {
  validateGalleryImage(file);

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const uniqueId = globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const monthFolder = new Date().toISOString().slice(0, 7);
  const filePath = `${monthFolder}/${uniqueId}.${extension}`;
  const { error } = await supabase.storage.from(BUCKET).upload(filePath, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    console.error(error);
    throw new Error("Görsel yüklenemedi. Lütfen tekrar deneyin.");
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

export async function deleteGalleryImages(paths) {
  if (!paths?.length) return;

  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error) console.error("Galeri görselleri temizlenemedi:", error);
}

export function validateGalleryImage(file) {
  if (!file) throw new Error("Görsel seçilmedi.");

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Görsel JPEG, PNG veya WebP formatında olmalıdır.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Görsel boyutu 8 MB'den küçük olmalıdır.");
  }
}

async function deleteGalleryImagesByUrl(urls) {
  const paths = urls
    .filter(Boolean)
    .map(extractStoragePath)
    .filter(Boolean);

  await deleteGalleryImages([...new Set(paths)]);
}

function extractStoragePath(url) {
  if (!url) return null;

  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;

  return decodeURIComponent(url.slice(index + marker.length));
}
