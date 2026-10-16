import { _getDb, availableQtyFor } from './loanService.js';

/** รายการอุปกรณ์ · มี availableQty สำเร็จ */
export function listEquipment() {
  const db = _getDb();
  const rows = db.prepare(
    'SELECT id, name, total_qty AS totalQty, location, category FROM equipment ORDER BY id'
  ).all();
  return rows.map(r => ({ ...r, availableQty: availableQtyFor(r.id) }));
}

export function findEquipment(id) {
  const db = _getDb();
  const row = db.prepare(
    'SELECT id, name, total_qty AS totalQty, location, category FROM equipment WHERE id = ?'
  ).get(id);
  if (!row) return null;
  return { ...row, availableQty: availableQtyFor(row.id) };
}
