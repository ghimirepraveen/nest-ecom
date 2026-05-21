import { PaginationDto } from '../dto/pagination.dto';
import { PaginatedResult } from '../interfaces/paginated-result.interface';

export interface PaginationQuery<T> {
  skip(value: number): this;
  limit(value: number): this;
  exec(): Promise<T[]>;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

function toSafePositiveInt(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  const intValue = Math.trunc(parsed);
  return intValue > 0 ? intValue : fallback;
}

function normalizePagination(dto: PaginationDto): {
  page: number;
  limit: number;
} {
  const page = toSafePositiveInt(dto.page, DEFAULT_PAGE);
  const limit = Math.min(
    toSafePositiveInt(dto.limit, DEFAULT_LIMIT),
    MAX_LIMIT,
  );

  return { page, limit };
}

function normalizeTotal(total: number): number {
  if (!Number.isFinite(total) || total < 0) {
    return 0;
  }

  return Math.trunc(total);
}

export async function paginate<T>(
  query: PaginationQuery<T>,
  total: number,
  dto: PaginationDto,
): Promise<PaginatedResult<T>> {
  const { page, limit } = normalizePagination(dto);
  const safeTotal = normalizeTotal(total);
  const skip = (page - 1) * limit;
  const data = await query.skip(skip).limit(limit).exec();
  const totalPages = safeTotal === 0 ? 0 : Math.ceil(safeTotal / limit);
  const hasPreviousPage = page > 1;
  const hasNextPage = totalPages > 0 && page < totalPages;

  return {
    data,
    meta: {
      page,
      limit,
      total: safeTotal,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    },
  };
}
