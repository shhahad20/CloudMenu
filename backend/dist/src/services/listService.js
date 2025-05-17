/**
 * Returns { data: T[], total: number } where total is the exact row count ignoring pagination.
 */
export async function listService(supabase, opts) {
    const { table, select = "*", filters = {}, search, sort, pagination, } = opts;
    // start building the query
    let query = supabase
        .from(table)
        // ask Supabase for an exact count
        .select(select, { count: "exact" });
    // eq-filters
    for (const [col, val] of Object.entries(filters)) {
        query = query.eq(col, val);
    }
    // ilike search
    if (search && search.term) {
        const clauses = search.columns
            .map(col => `${col}.ilike.%${search.term}%`)
            .join(",");
        query = query.or(clauses);
    }
    // sorting
    if (sort) {
        query = query.order(sort.column, { ascending: sort.order !== "asc" });
    }
    // pagination
    if (pagination) {
        const { page, pageSize } = pagination;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
    }
    const { data, count, error } = await query;
    if (error)
        throw error;
    return { data: (data ?? []), total: count ?? 0 };
}
