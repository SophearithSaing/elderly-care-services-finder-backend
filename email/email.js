const sgMail = require('@sendgrid/mail');
const sendGridAPIKey = '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';

sgMail.setApiKey(sendGridAPIKey);

const msg = {
  to: 'sophearithsaing123@gmail.com',
  from: 'test@example.com',
  subject: 'Sending with Twilio SendGrid is Fun',
  dynamic_template_data: {
    "cgName": "Sophearith Saing",
  },
  template_id: 'd-63b55b18f639489092d80093fc01d8a0'
};
// sgMail.send(msg);
// console.log('sent')

const sendPasswordResetEmail = (email, name, url) => {
  console.log('sending to ' + email);
  const msg = {
    to: `${email}`,
    from: 'test@example.com',
    subject: 'Reset Your Password (expires in 10 minutes)',
    dynamic_template_data: {
      'name': `${name}`,
      'url': `${url}`
    },
    template_id: 'd-f4b68d6038b0400fa0d704a23506e4cd'
  };
  sgMail.send(msg);
};

const sendPasswordResetConfirmEmail = (email, name, url) => {
  console.log('sending to ' + email);
  const msg = {
    to: `${email}`,
    from: 'test@example.com',
    subject: 'Reset Password Confirmation',
    dynamic_template_data: {
      'name': `${name}`
    },
    template_id: 'd-522c99ca27534590bf627cd9dc82462a'
  };
  sgMail.send(msg);
};

const sendCaregiverAcceptEmail = (email, name) => {
  console.log('sending to ' + email + ' for ' + name);
  const msg = {
    to: `${email}`,
    from: 'test@example.com',
    subject: 'Your Request was Rejected',
    dynamic_template_data: {
      'name': `${name}`,
    },
    template_id: 'd-b273721896f5456fb831a4f5f70f411e'
  };
  sgMail.send(msg);
}

const sendCaregiverRejectionEmail = (email, name, reason) => {
  console.log('sending to ' + email + ' for ' + name);
  const msg = {
    to: `${email}`,
    from: 'test@example.com',
    subject: 'Your Request was Rejected',
    dynamic_template_data: {
      'name': `${name}`,
      'reason': `${reason}`
    },
    template_id: 'd-b4fef1b69d8c4c0bb178a091f58fd420'
  };
  sgMail.send(msg);
}

const sendCaregiverWelcomeEmail = (email, name) => {
  console.log('sending to ' + email + ' for ' + name);
  const msg = {
    to: `${email}`,
    from: 'test@example.com',
    subject: 'Welcome to Our Service',
    dynamic_template_data: {
      'cgName': `${name}`,
    },
    template_id: 'd-63b55b18f639489092d80093fc01d8a0'
  };
  sgMail.send(msg);
}

const sendElderWelcomeEmail = (email, name) => {
  console.log('sending to ' + email + ' for ' + name);
  const msg = {
    to: `${email}`,
    from: 'test@example.com',
    subject: 'Welcome to Our Service',
    dynamic_template_data: {
      'edName': `${name}`,
    },
    template_id: 'd-0b70b0175f9b469aa2919ddc274c9a39'
  };
  sgMail.send(msg);
}

const sendCaregiverUpdateEmail = (email, name) => {
  console.log('sending to ' + email + ' for ' + name);
  const msg = {
    to: `${email}`,
    from: 'test@example.com',
    subject: 'Welcome to Our Service',
    dynamic_template_data: {
      'cgName': `${name}`,
    },
    template_id: 'd-0b70b0175f9b469aa2919ddc274c9a39'
  };
  sgMail.send(msg);
};

const sendElderUpdateEmail = (email, name) => {
  console.log('sending to ' + email + ' for ' + name);
  const msg = {
    to: `${email}`,
    from: 'test@example.com',
    subject: 'Welcome to Our Service',
    dynamic_template_data: {
      'edName': `${name}`,
    },
    template_id: 'd-0b70b0175f9b469aa2919ddc274c9a39'
  };
  sgMail.send(msg);
};

const sendRequestReceivedEmail = (cgEmail, cgName, eEmail, eName, eAge, ePhoneNumber, dailyCare, specialCare, startDate, stopDate, requireInterview, totalDays) => {
  let interview = '';
  if (requireInterview === true) {
    interview = 'Required.';
  } else if (require === false) {
    interview = 'Not Required.';
  }
  // const newStartDate = new Date(`${startDate}`)
  // const newStopDate = new Date(`${stopDate}`)
  // const totalDays = Math.trunc((newStopDate.getTime() - newStartDate.getTime()) / 86400000);
  // const totalPrice = totalDays * dailyPrice;
  console.log(`sending to ${cgEmail} and ${eEmail}`);
  const msg = {
    to: `${cgEmail}`,
    from: 'test@example.com',
    subject: 'New Request Received',
    dynamic_template_data: {
      'cgName': `${cgName}`,
      'eName': `${eName}`,
      'eAge': `${eAge}`, 
      'eEmail': `${eEmail}`, 
      'ePhoneNumber': `${ePhoneNumber}`, 
      'dailyCare': `${dailyCare}`, 
      'specialCare': `${specialCare}`, 
      'startDate': `${startDate}`,
      'stopDate': `${stopDate}`,
      'interview': `${interview}`,
      'days': `${totalDays}`,
    },
    template_id: 'd-34489fb4327b44bf87ed541bff7423b1'
  };
  sgMail.send(msg);
}

const sendRequestSentEmail = (cgEmail, cgName, eEmail, eName, eAge, ePhoneNumber, dailyCare, specialCare, startDate, stopDate, requireInterview, totalDays) => {
  let interview = '';
  if (requireInterview === true) {
    interview = 'Required.';
  } else if (require === false) {
    interview = 'Not Required.';
  }
  console.log(`sending to ${cgEmail} and ${eEmail}`);
  const msg = {
    to: `${cgEmail}`,
    from: 'test@example.com',
    subject: 'New Request Received',
    dynamic_template_data: {
      'cgName': `${cgName}`,
      'eName': `${eName}`,
      'eAge': `${eAge}`, 
      'eEmail': `${eEmail}`, 
      'ePhoneNumber': `${ePhoneNumber}`, 
      'dailyCare': `${dailyCare}`, 
      'specialCare': `${specialCare}`, 
      'startDate': `${startDate}`,
      'stopDate': `${stopDate}`,
      'interview': `${interview}`,
      'days': `${totalDays}`,
    },
    template_id: 'd-34489fb4327b44bf87ed541bff7423b1' // not yet added
  };
  sgMail.send(msg);
}

const sendRequestResponseEmail = (eEmail, eName, cgName, rejection) => {
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

const sendUpdateServicesEmail = (eEmail, eName, cgName, rejection) => {
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
  sendPasswordResetEmail,
  sendPasswordResetConfirmEmail,
  sendElderWelcomeEmail,
  sendCaregiverWelcomeEmail,
  sendCaregiverAcceptEmail,
  sendCaregiverRejectionEmail,
  sendElderUpdateEmail,
  sendCaregiverUpdateEmail,
  sendRequestSentEmail,
  sendRequestReceivedEmail,
  sendRequestResponseEmail,
  sendUpdateServicesEmail
}
