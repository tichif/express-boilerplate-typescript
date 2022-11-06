import { string, object, TypeOf } from 'zod';

export const registerUserSchema = object({
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
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: 'Les mot de passe ne correspondent pas.',
    path: ['passwordConfirmation'],
  }),
});

export const activeUserAccountSchema = object({
  params: object({
    activeToken: string({
      required_error: 'Le token est obligatoire.',
    }),
  }),
});

export const loginUserSchema = object({
  body: object({
    email: string({
      required_error: 'Ton email est obligatoire',
    })
      .email('Ton email est incorrect.')
      .trim(),
    password: string({
      required_error: 'Ton mot de passe est obligatoire.',
    }),
  }),
});

export const resendEmailSchema = object({
  body: object({
    email: string({
      required_error: 'Ton email est obligatoire',
    })
      .email('Ton email est incorrect.')
      .trim(),
  }),
});

export const resetPasswordSchema = object({
  params: object({
    resetToken: string({
      required_error: 'Le token est obligatoire.',
    }),
  }),
  body: object({
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
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: 'Les mot de passe ne correspondent pas.',
    path: ['passwordConfirmation'],
  }),
});

export type RegisterUserType = TypeOf<typeof registerUserSchema>['body'];
export type ActiveUserAccountType = TypeOf<
  typeof activeUserAccountSchema
>['params'];
export type LoginUserType = TypeOf<typeof loginUserSchema>['body'];
export type ResendEmailType = TypeOf<typeof resendEmailSchema>['body'];
export type ResetPasswordType = TypeOf<typeof resetPasswordSchema>;
