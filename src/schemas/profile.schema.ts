import { object, string, TypeOf } from 'zod';

export const updateUserInfoSchema = object({
  body: object({
    name: string({
      required_error: 'Ton nom est obligatoire.',
    })
      .min(5, 'Ton nom doit contenir au moins 5 caratères.')
      .max(150, 'Ton nom ne doit contenir pas plus 150 caractères.')
      .regex(/^[a-zA-ZÀ-ÿ-. ]*$/, 'Ton nom est incorrect')
      .trim(),
    password: string({
      required_error: 'Ton mot de passe est obligatoire.',
    })
      .min(8, 'Ton mot de pase doit contenir au moins 8 caratctères.')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
        'Ton mot de passe doit contenir au moins un chiffre - au moins une lettre majuscule - au moins une lettre minuscule et un caractère spécial.'
      ),
    passwordConfirmation: string({
      required_error: 'Tu dois confirmer ton mot de passe.',
    }),
    telephone: string({
      required_error: 'Le numére de ton téléphone est obligatoire.',
    })
      .regex(/^\d{8}$/, 'Le numéro est incorrect.')
      .trim(),
  })
    .partial({
      password: true,
      passwordConfirmation: true,
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: 'Les mot de passe ne correspondent pas.',
      path: ['passwordConfirmation'],
    }),
});

export type UpdateUserInfoType = TypeOf<typeof updateUserInfoSchema>['body'];
