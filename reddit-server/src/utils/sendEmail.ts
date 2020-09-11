const API_KEY = process.env.MAILING_KEY;
const DOMAIN = process.env.MAILING_DOMAIN;
const mailgun = require('mailgun-js')({ apiKey: API_KEY, domain: DOMAIN });

const sendMail = (to: string, subject: string, html: string) => {
  console.log(API_KEY)
  console.log(DOMAIN)
  const data = {
    from: 'Jones <jay.topher11@gmail.com>',
    to: to,
    subject: subject,
    html,
  };

  mailgun.messages().send(data, (error: any, body: any) => {
    if (error) {
      console.log('Error', error);
      throw Error(error);
    }
    console.log(body);
  });
};

export default sendMail;


