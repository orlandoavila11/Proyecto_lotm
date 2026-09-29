-- Canon (auditoría general §3.2): Bayam es una ciudad del archipiélago de Rorsted, no un distrito de Backlund
-- al que se llega en carruaje. Se sustituye por el Distrito Norte (cuyo mercado ya existía y no era alcanzable).
-- sólo en bases ya sembradas: en una base nueva el sembrado inicial (DatabaseClient) ya trae el Distrito Norte
INSERT OR IGNORE INTO districts (id, city, district_name, tension_level, inquisitorial_alert, convergence_index)
  SELECT 'DIST_NORTH', 'Backlund', 'Distrito Norte (Bolsa & Comercio)', 20, 20, 10
  WHERE EXISTS (SELECT 1 FROM districts);
UPDATE characters SET current_location = 'DIST_CHERWOOD' WHERE current_location LIKE '%BAYAM%' OR current_location LIKE '%Bayam%';
DELETE FROM districts WHERE id = 'DIST_BAYAM';

-- Anacronismo del mundo real en el ancla del Detective Privado (partidas ya creadas)
UPDATE anchors SET name = 'Inspector Jonas Kettle', title = 'Inspector Jonas Kettle',
  description = 'Inspector de la comisaría de Cherwood que tolera a los sabuesos privados siempre que sus hallazgos no comprometan los informes ministeriales.'
  WHERE name = 'Inspector Lestrade';
