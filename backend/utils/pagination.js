/**
 * Pagination helper utility
 */

/**
 * Paginate query results
 * @param {Array} data - Data array to paginate
 * @param {number} page - Current page (1-indexed)
 * @param {number} limit - Items per page
 * @returns {object} Paginated result with metadata
 */
export const paginate = (data, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const paginatedData = data.slice(offset, offset + limit);

    return {
        data: paginatedData,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: data.length,
            totalPages: Math.ceil(data.length / limit),
            hasNext: offset + limit < data.length,
            hasPrev: page > 1
        }
    };
};

/**
 * Get pagination params from request
 * @param {object} req - Express request object
 * @returns {object} Pagination parameters
 */
export const getPaginationParams = (req) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    return {
        page: Math.max(1, page),
        limit: Math.min(100, Math.max(1, limit)) // Max 100 items per page
    };
};

/**
 * Create pagination metadata
 * @param {number} total - Total items count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object} Pagination metadata
 */
export const createPaginationMeta = (total, page, limit) => {
    return {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
    };
};

export default {
    paginate,
    getPaginationParams,
    createPaginationMeta
};
