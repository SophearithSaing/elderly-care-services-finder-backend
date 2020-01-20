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
    subject: 'Profile Updated',
    text: `Hi, ${name}. Your profile has recently been updated.`
  })
};

const sendRequestEmail = (cgEmail, cgName, eEmail, eName, startDate, stopDate, requireInterview ) => {
  const interview = '';
  if (requireInterview === true) {
    interview = 'Interview is required.';
  } else if (require === false) {
    interview = 'Interview is not required.';
  }
  console.log(`sending to ${cgEmail} and ${eEmail}`);
  sgMail.send({
    to: cgEmail,
    from: 'noreply@ecsf.com',
    subject: 'New Request',
    text: `Hi, ${cgName}. You have recieve a new request from ${eName} from ${startDate} to ${stopDate}. ${interview}`
  })
}

const sendResponseEmail = (eEmail, eName, cgName, rejection) => {
  const rejected = '';
  const rejectedSubject = '';
  if (rejection === true) {
    rejected = 'rejected';
    rejectedSubject = 'Rejected';
  } else if (rejection === false) {
    rejected = 'accepted';
    rejectedSubject = 'Accepted';
  }
  console.log(`sending to ${eEmail}`);
  sgMail.send({
    to: eEmail,
    from: 'noreply@ecsf.com',
    subject: `Request ${rejectedSubject}`,
    text: `Hi, ${cgName}. Your request that was sent to ${cgEmail} was ${rejected}.`
  })
}

module.exports = {
  sendWelcomeEmail,
  sendUpdateEmail
}
