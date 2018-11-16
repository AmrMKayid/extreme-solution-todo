const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const htmlToText = require('nodemailer-html-to-text');
const config = require('./index');

const sender = nodemailer.createTransport(
  mg({
    from: config.MAILER_SENDER,
    auth: {
      api_key: config.MAILER_API_KEY,
      domain: config.MAILER_DOMAIN,
    },
  }),
);
sender.use('compile', htmlToText.htmlToText());

module.exports = sender;
