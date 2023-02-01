import sendMail from './sendMail';

const sendUserEmailVerification = async (
  email: string,
  verificationUrl: string,
) => {
  const sender_email = process.env['MAIL_USER'];
  const email_subject = 'Email verification from Interview Experience';
  const email_template = 'send_user_email_verification';

  const context = { verificationUrl };

  const mailOptions = {
    from: sender_email,
    to: email,
    subject: email_subject,
    template: email_template,
    context: context,
  };

  return await sendMail(mailOptions);
};

export default sendUserEmailVerification;
