import { object, string, TypeOf } from 'zod';

export const advancedResultSchema = object({
  query: object({
    select: string(),
    limit: string(),
    sort: string(),
    page: string(),
  }).partial({
    limit: true,
    select: true,
    sort: true,
    page: true,
  }),
});

export type AdvancedResultType = TypeOf<typeof advancedResultSchema>['query'];
