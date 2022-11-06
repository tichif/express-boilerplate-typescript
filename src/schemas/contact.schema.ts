import { object, string, TypeOf } from 'zod';

export const contactSchema = object({
  body: object({
    name: string({
      required_error: 'Ton nom est obligatoire.',
    })
      .min(5, 'Ton nom doit contenir au moins 5 caratères.')
      .max(150, 'Ton nom ne doit contenir pas plus 150 caractères.')
      .regex(/^[a-zA-ZÀ-ÿ-. ]*$/, 'Ton nom est incorrect')
      .trim(),
    email: string({
      required_error: 'Ton email est obligatoire',
    })
      .email('Ton email est incorrect.')
      .trim(),
    subject: string({
      required_error: 'Le but de ton message est obligatoire',
    })
      .min(5, 'Le but de ton message doit contenir au moins 5 caractères.')
      .max(
        150,
        'Le but de ton message ne doit contenir pas plus 150 caractères.'
      )
      .trim(),
    message: string({
      required_error: 'Ton message est obligatoire.',
    })
      .min(10, 'Ton message doit contenir au moins 10 caractères.')
      .max(500, 'Ton message ne doit pas contenir plus de 500 caractères')
      .trim(),
  }),
});

export type ContactType = TypeOf<typeof contactSchema>['body'];
