import sendMail from './sendMail';

const sendForgotPasswordMail = async (
  email: string,
  token: string,
  username: string,
) => {
  const CLIENT_BASE_URL = process.env['CLIENT_BASE_URL'];
  if (!CLIENT_BASE_URL) {
    throw new Error('CLIENT_BASE_URL not Defined');
  }

  const verificationURL = CLIENT_BASE_URL + '/' + 'reset-password/' + token;
  const senderEmail = process.env['MAIL_USER'];
  const emailSubject = 'Reset Password Link';
  const emailTemplate = 'forgot_password_email';
  const officialName = 'InterviewExperience';
  const context = { verificationURL, username, officialName };

  const mailOptions = {
    from: senderEmail,
    to: email,
    subject: emailSubject,
    template: emailTemplate,
    context: context,
  };

  return await sendMail(mailOptions);
};

export default sendForgotPasswordMail;
