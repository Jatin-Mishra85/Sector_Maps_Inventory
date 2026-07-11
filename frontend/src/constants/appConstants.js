export const INVENTORY_TYPES = Object.freeze({
  PROJECT: 'PROJECT',
  COLONY: 'COLONY',
  BLOCK: 'BLOCK',
});

export const INVENTORY_TYPE_LABELS = {
  [INVENTORY_TYPES.PROJECT]: 'Project',
  [INVENTORY_TYPES.COLONY]: 'Colony',
  [INVENTORY_TYPES.BLOCK]: 'Block',
};

export const ALL_DEVELOPERS_ID = 'ALL';

export const ALL_TYPES_ID = 'ALL_TYPES';

export const BOOKMARK_STORAGE_KEY = 'bookmarked_inventories';

export const TOAST_TYPES = Object.freeze({
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
});

export const TOAST_DEFAULT_DURATION_MS = 4000;

export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
});