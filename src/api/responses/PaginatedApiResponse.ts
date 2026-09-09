interface PaginatedApiResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  } | null;
}

export default PaginatedApiResponse;
