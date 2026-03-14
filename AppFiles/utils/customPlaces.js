// customPlaces.js — Add and remove custom (user-created) places

import { STORAGE_KEYS } from '../constants/storage';

import { normalize, safeStore } from './helpers';

/**
 * Add a user-created custom place, checking for duplicates by name and address.
 * @param {string} name - Place name
 * @param {string} address - Place address
 * @param {object} opts - Options bag
 * @param {string} [opts.notes] - User notes
 * @param {string} [opts.tags] - Comma-separated tags
 * @param {Array} opts.currentCustom - Current custom places list
 * @param {Function} opts.setCustom - Custom places state setter
 * @returns {{ok: boolean, reason?: string, dupe?: string, dupeAddr?: string}}
 */
export function addCustomPlace(name, address, opts) {
  const { notes, tags, currentCustom, setCustom } = opts;
  const trimmed = name.trim();
  if (!trimmed) return { ok: false };
  const normalName = normalize(trimmed);
  const normalAddr = normalize(address.trim());
  const nameMatch = currentCustom.find((cp) => normalize(cp.name) === normalName);
  if (nameMatch) {
    return { ok: false, reason: 'name', dupe: nameMatch.name, dupeAddr: nameMatch.vicinity };
  }
  if (normalAddr) {
    const addrMatch = currentCustom.find(
      (cp) => cp.vicinity && normalize(cp.vicinity) === normalAddr,
    );
    if (addrMatch) {
      return { ok: false, reason: 'address', dupe: addrMatch.name };
    }
  }
  const newPlace = {
    place_id: `custom_${Date.now()}`,
    name: trimmed,
    vicinity: address.trim() || '',
    notes: notes?.trim() || '',
    tags: tags?.trim() || '',
    isCustom: true,
    rating: null,
    price_level: null,
    user_ratings_total: 0,
    createdAt: Date.now(),
  };
  const updated = [newPlace, ...currentCustom];
  setCustom(updated);
  safeStore(STORAGE_KEYS.CUSTOM_PLACES, updated);
  return { ok: true };
}

/**
 * Remove a custom place by ID.
 * @param {string} placeId - Place ID to remove
 * @param {Array} currentCustom - Current custom places list
 * @param {Function} setCustom - Custom places state setter
 */
export function removeCustomPlace(placeId, currentCustom, setCustom) {
  const updated = currentCustom.filter((p) => p.place_id !== placeId);
  setCustom(updated);
  safeStore(STORAGE_KEYS.CUSTOM_PLACES, updated);
}
