import type { ReactElement } from 'react';
import type { PlaceId } from '../session/store';
import { Ascension } from './Ascension';
import { Bazaar } from './Bazaar';
import { Board } from './Board';
import { Cherwood } from './Cherwood';
import { Combat } from './Combat';
import { Journal } from './Journal';
import { Location } from './Location';

/** Lugares del recorrido V02–V08. */
export const PLACES_EXTRA: Partial<Record<PlaceId, () => ReactElement | null>> = {
  cherwood: Cherwood,
  location: Location,
  board: Board,
  combat: Combat,
  bazaar: Bazaar,
  journal: Journal,
  ascension: Ascension
};
