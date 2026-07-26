-- Sprint 7: remove an unverified before image from the landscaping case.
--
-- The existing before and after files show different properties, so they must
-- not be presented as two stages of the same customer job. Keep the verified
-- completed-work image published and restore before/after only when an
-- authentic source image is available.

update public.gallery_items
set
  before_image_url = null,
  before_label = null,
  updated_at = now()
where title = 'Villa Bahçe Peyzajı ve Çit Çevirme İşlemi'
  and before_image_url is not null;
