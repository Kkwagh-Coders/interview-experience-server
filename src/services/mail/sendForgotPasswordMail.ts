import sendMail from './sendMail';

const sendForgotPasswordMail = async (
  email: string,
  verificationURL: string,
  username: string,
) => {
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
