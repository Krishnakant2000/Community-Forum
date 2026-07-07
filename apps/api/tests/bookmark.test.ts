import { describe, it, expect } from 'vitest';
import { calculateBookmarkTransition } from '../src/domain/bookmark.logic';

describe('Unit: Pure Bookmark Transition Logic', () => {
  describe('Action: SAVE', () => {
    it('should return CREATE_NEW when saving a post with no prior history', () => {
      const result = calculateBookmarkTransition(null, 'SAVE');
      expect(result).toEqual({ type: 'CREATE_NEW' });
    });

    it('should return NO_OP when saving a post that is already actively saved (Idempotency)', () => {
      const activeRecord = { exists: true, isSoftDeleted: false };
      const result = calculateBookmarkTransition(activeRecord, 'SAVE');
      
      expect(result.type).toBe('NO_OP');
      if (result.type === 'NO_OP') {
        expect(result.reason).toBe('Post is already saved by this user.');
      }
    });

    it('should return REACTIVATE when saving a previously soft-deleted bookmark', () => {
      const deletedRecord = { exists: true, isSoftDeleted: true };
      const result = calculateBookmarkTransition(deletedRecord, 'SAVE');
      expect(result).toEqual({ type: 'REACTIVATE' });
    });
  });

  describe('Action: UNSAVE', () => {
    it('should return SOFT_DELETE when un-saving an actively saved post', () => {
      const activeRecord = { exists: true, isSoftDeleted: false };
      const result = calculateBookmarkTransition(activeRecord, 'UNSAVE');
      expect(result).toEqual({ type: 'SOFT_DELETE' });
    });

    it('should return NO_OP when un-saving a post that was never saved (Idempotency)', () => {
      const result = calculateBookmarkTransition(null, 'UNSAVE');
      expect(result.type).toBe('NO_OP');
    });

    it('should return NO_OP when un-saving an already soft-deleted post (Idempotency)', () => {
      const deletedRecord = { exists: true, isSoftDeleted: true };
      const result = calculateBookmarkTransition(deletedRecord, 'UNSAVE');
      expect(result.type).toBe('NO_OP');
    });
  });
});