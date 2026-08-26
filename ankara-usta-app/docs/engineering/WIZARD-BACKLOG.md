# Service-specific Wizard Backlog

Version: 1.0
Date: 26 August 2026

The six validated custom wizards are TV wall mounting, electrical fault, water leak detection, single-room painting, garden gate repair, and home cleaning. Until discovery and content review are complete, the remaining twenty services receive the shared two-question fallback from the data layer.

| Service ID | Discovery focus | Delivery model | Status |
| --- | --- | --- | --- |
| `mobilya-kurulumu` | Item types, quantity, assembly state, wall fixing | package | backlog |
| `kornis-perde-montaji` | Rail length, ceiling material, existing rail | package | backlog |
| `raf-tablo-montaji` | Item count/weight, wall type, fixing hardware | package | backlog |
| `avize-montaji` | Fixture count/weight, ceiling height, electrical point | package | backlog |
| `priz-anahtar` | Unit count, fault symptoms, product supply | package | backlog |
| `sigorta-pano` | Tripping pattern, panel age, safety symptoms | inspection | backlog |
| `elektrik-hatti` | Endpoint, route length, surface/channel preference | quote | backlog |
| `musluk-degisimi` | Fixture type, connection condition, product supply | package | backlog |
| `gider-acma` | Fixture/location, blockage severity, recurrence | package | backlog |
| `klozet-rezervuar` | Cistern type, leak/fault symptom, replacement need | quote | backlog |
| `tesisat-onarim` | Pipe/valve location, leak state, accessibility | quote | backlog |
| `duvar-alci` | Damage dimensions, moisture, finish expectation | quote | backlog |
| `fayans-onarimi` | Tile count/size, spare tiles, substrate condition | quote | backlog |
| `silikon-yenileme` | Linear length, surface type, removal requirement | package | backlog |
| `korkuluk` | Material, damage type, height/access risk | inspection | backlog |
| `metal-kapi-mentese` | Door weight, hinge damage, alignment/lock state | quote | backlog |
| `ozel-demir-imalati` | Product dimensions, material/finish, installation | inspection | backlog |
| `detayli-temizlik` | Room count, occupancy, priority zones, supplies | quote | backlog |
| `tadilat-sonrasi-temizlik` | Area, debris/dust level, empty/occupied state | quote | backlog |
| `cam-temizligi` | Panel count, height/access, balcony/enclosure type | package | backlog |

## Definition of ready

A service leaves this backlog when its questions, conditional branches, safety guidance, answer identifiers, result model, and customer-facing wording have been reviewed. The definition must then pass the shared runtime and integrity tests before being connected to the UI.
