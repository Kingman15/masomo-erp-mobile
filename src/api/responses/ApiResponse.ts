interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}

export default ApiResponse;
