import { inventoryService } from '../../inventory/services/inventoryService';

// Thin, dedicated layer so search concerns (query shaping) stay
// out of both components and the generic inventory service.
export const searchService = {
  searchInventories: (query, extraParams = {}) =>
    inventoryService.search({ q: query, ...extraParams }),
};