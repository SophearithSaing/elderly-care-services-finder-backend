const sgMail = require('@sendgrid/mail');
const sendGridAPIKey = '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';

sgMail.setApiKey(sendGridAPIKey);

const msg = {
  to: 'sophearithsaing123@gmail.com',
  from: 'test@example.com',
  subject: 'Sending with Twilio SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  // html: '<strong>and easy to do anywhere, even with Node.js</strong>',
};
sgMail.send(msg);

const sendWelcomeEmail = (email, name) => {
  console.log('sending to ' + email + ' for ' + name);
  sgMail.send({
    to: email,
    from: 'noreply@ecsf.com',
    subject: 'Thank You for Joining Us!',
    text: `Welcome to the app, ${name}.`
  })
}

const sendUpdateEmail = (email, name) => {
  console.log('sending to ' + email + ' for ' + name);
  sgMail.send({
    to: email,
    from: 'noreply@ecsf.com',
    subject: 'Thank You for Joining Us!',
    text: `Hi, ${name}. Your profile has recently been updated.`
  })
};

module.exports = {
  sendWelcomeEmail,
  sendUpdateEmail
}
