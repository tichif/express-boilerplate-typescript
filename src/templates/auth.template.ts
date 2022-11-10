import config from '../config';

interface Options {
  name: string;
  activeToken?: string;
  resetToken?: string;
}

export function activateAccountTemplate(options: Options): string {
  return `
  <html>
  <body>
    <p>Hello ${options.name},</p>
    <p>Ceci est un email concernant l'activation de votre compte, veuillez cliquer sur ce lien valable pendent 10 minutes:</p>
    <p><a href="${config.addressServer}/auth/activeaccount/${options.activeToken}">${config.addressServer}/auth/activeaccount/${options.activeToken}</a></p>
    <img src=${config.logoAddress} alt="logo" style="height: 80px; width: 80px;">
    <p>Cordialement, ${config.enterpriseName}</p>
  </body>
</html>
  `;
}

export function resetPasswordTemplate(options: Options): string {
  return `
  <html>
      <body>
        <p>Hello ${options.name},</p>
        <p>Vous recevez ce message parce que vous (ou quelqu'un d'autre) avez fait la requête de réinitialiser le mot de passe de votre compte. Veuillez cliquer sur ce lien valable pendant 10 minutes:</p>
        <p><a href="${config.addressServer}/auth/resetpassword/${options.resetToken}">${config.addressServer}/auth/resetpassword/${options.resetToken}</a></p>
        <p>Si ce n'est pas vous, ne vous occupez pas de ce message.</p>
        <img src=${config.logoAddress} alt="logo" style="height: 80px; width: 80px;">
        <p>Cordialement, ${config.enterpriseName}</p>
      </body>
    </html>
  `;
}
