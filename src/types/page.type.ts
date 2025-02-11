export type PageInfo = {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
}

export type PaginationLinks = {
    nextPage: string | null,
    prevPage: string | null,
    firstPage: string | null,
    lastPage: string | null,
}

export type PageFilter = {
    pageNo: string;
    pageLimit: string;
}

export type PaginationParams = {
    page: number;
    limit: number;
    skip: number;
}