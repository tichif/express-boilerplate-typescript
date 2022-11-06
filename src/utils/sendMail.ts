import sgMail, { MailDataRequired } from '@sendgrid/mail';

import config from '../config';
import Logging from './log';

sgMail.setApiKey(config.sendgridApiKey);

const sendMail = async (options: MailDataRequired) => {
  try {
    const response = await sgMail.send(options);
    Logging.info(response[0].statusCode);
  } catch (error: any) {
    Logging.error(error.message);
  }
};

export default sendMail;
