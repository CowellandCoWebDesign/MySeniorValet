const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: 'william.cowell01@gmail.com',
  from: 'hello@myseniorvalet.com',
  subject: 'Test Email from MySeniorValet',
  text: 'This is a test email from MySeniorValet notification system.',
  html: '<strong>This is a test email from MySeniorValet notification system.</strong>',
};

sgMail.send(msg)
  .then(() => {
    console.log('✅ Email sent successfully!');
  })
  .catch((error) => {
    console.error('❌ Error sending email:');
    console.error(error.response?.body || error);
  });
