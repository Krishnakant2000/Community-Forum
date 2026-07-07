export type SaveRecordState = {
  exists: boolean;
  isSoftDeleted: boolean;
};

export type BookmarkAction = 'SAVE' | 'UNSAVE';

export type TransitionResult = 
  | { type: 'NO_OP'; reason: string }
  | { type: 'CREATE_NEW' }
  | { type: 'REACTIVATE' }
  | { type: 'SOFT_DELETE' };

/**
 * Pure function determining the database mutation required.
 * Guarantees idempotency and history preservation without needing DB connection.
 */
export function calculateBookmarkTransition(
  record: SaveRecordState | null,
  action: BookmarkAction
): TransitionResult {
  if (action === 'SAVE') {
    // Case 1: No prior record exists
    if (!record || !record.exists) {
      return { type: 'CREATE_NEW' };
    }
    // Case 2: Record exists and is NOT soft-deleted -> Idempotent No-Op
    if (!record.isSoftDeleted) {
      return { type: 'NO_OP', reason: 'Post is already saved by this user.' };
    }
    // Case 3: Record exists but WAS soft-deleted -> Reactivate
    return { type: 'REACTIVATE' };
  } 

  // Action === 'UNSAVE'
  // Case 4: No record exists, or it's already soft-deleted -> Idempotent No-Op
  if (!record || !record.exists || record.isSoftDeleted) {
    return { type: 'NO_OP', reason: 'Post is not currently saved.' };
  }
  
  // Case 5: Active record exists -> Soft Delete
  return { type: 'SOFT_DELETE' };
}