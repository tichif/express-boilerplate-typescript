import { object, string, TypeOf } from 'zod';

export const getUserIdSchema = object({
  params: object({
    userId: string({
      required_error: "L'ID de l'utilisateur est obligatoire.",
    }),
  }),
});

export type GetUserIdType = TypeOf<typeof getUserIdSchema>['params'];
