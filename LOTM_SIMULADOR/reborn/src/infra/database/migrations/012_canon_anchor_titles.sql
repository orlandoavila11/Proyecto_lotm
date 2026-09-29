-- Canon (HUMAN_REVIEW_CANON.md C8): el ancla de la resolución D no lleva texto mecánico en inglés en su nombre.
UPDATE anchors SET title = 'Los Susurros del Nido', name = 'Los Susurros del Nido'
  WHERE title LIKE 'Trait Permanente: Los Susurros del Nido%' OR name LIKE 'Trait Permanente: Los Susurros del Nido%';
