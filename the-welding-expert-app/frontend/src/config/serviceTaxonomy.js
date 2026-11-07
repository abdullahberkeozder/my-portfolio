export const SERVICE_GROUPS = Object.freeze([
  {
    key: "finish",
    title: "Boya ve küçük tadilat",
    description: "Boya, badana, yüzey onarımı ve küçük tadilatlar",
    serviceAliases: [
      "Duvar boya ve badana",
      "Küçük inşaat ve ev tadilatı",
      "Boya ve badana",
      "İnşaat ve tadilat",
    ],
    galleryCategories: ["Boya ve badana", "İnşaat ve tadilat"],
    keywords: ["boya", "badana", "tadilat", "inşaat", "insaat"],
  },
  {
    key: "metal",
    title: "Kaynak ve metal işleri",
    description: "Kaynak, korkuluk, menteşe ve metal onarım işleri",
    serviceAliases: ["Kapı, korkuluk ve kaynak", "Kaynak ve metal"],
    galleryCategories: ["Kaynak ve metal"],
    keywords: ["kaynak", "korkuluk", "menteşe", "mentese", "metal", "demir"],
  },
  {
    key: "access",
    title: "Kapı ve otomasyon",
    description: "Raylı kapı, motor, kilit ve kontrollü geçiş sistemleri",
    serviceAliases: [
      "Raylı kapı sistemleri",
      "Otomatik kapı motorları",
      "Bina ve bahçe kapıları için akıllı kilit sistemleri",
    ],
    galleryCategories: [
      "Raylı kapı sistemleri",
      "Otomatik kapı motorları",
      "Bina ve bahçe kapıları için akıllı kilit sistemleri",
    ],
    keywords: ["raylı", "rayli", "otomatik kapı", "otomatik kapi", "motor", "akıllı kilit", "akilli kilit"],
  },
  {
    key: "outdoor",
    title: "Bahçe ve dış alan",
    description: "Bahçe düzenleme, peyzaj, çit ve dış alan işleri",
    serviceAliases: ["Bahçe peyzaj ve düzenleme", "Bahçe ve peyzaj"],
    galleryCategories: ["Bahçe ve peyzaj"],
    keywords: ["bahçe", "bahce", "peyzaj", "çit", "cit"],
  },
]);

const KEYWORD_MATCH_ORDER = ["access", "metal", "finish", "outdoor"];

function normalize(value) {
  return typeof value === "string"
    ? value.trim().toLocaleLowerCase("tr-TR")
    : "";
}

function getCandidateValues(service) {
  if (typeof service === "string") return [service];

  return [
    service?.service_key,
    service?.serviceType,
    service?.title,
    service?.category,
  ].filter(Boolean);
}

export function getServiceGroupByKey(groupKey) {
  return SERVICE_GROUPS.find((group) => group.key === groupKey) || null;
}

export function getServiceGroupKey(service) {
  const candidateValues = getCandidateValues(service).map(normalize);

  const exactGroup = SERVICE_GROUPS.find((group) =>
    [...group.serviceAliases, ...group.galleryCategories]
      .map(normalize)
      .some((alias) => candidateValues.includes(alias)),
  );

  if (exactGroup) return exactGroup.key;

  const searchable = [
    ...candidateValues,
    normalize(service?.problem),
    normalize(service?.description),
    normalize(service?.text),
  ].join(" ");

  return KEYWORD_MATCH_ORDER.find((groupKey) => {
    const group = getServiceGroupByKey(groupKey);
    return group.keywords.some((keyword) => searchable.includes(normalize(keyword)));
  }) || null;
}

export function getGalleryGroupKey(category) {
  const normalizedCategory = normalize(category);

  return SERVICE_GROUPS.find((group) =>
    group.galleryCategories.some(
      (candidate) => normalize(candidate) === normalizedCategory,
    ),
  )?.key || null;
}

export function isDiscoveryService(service) {
  return getCandidateValues(service)
    .map(normalize)
    .some((value) => value.includes("keşif"));
}
