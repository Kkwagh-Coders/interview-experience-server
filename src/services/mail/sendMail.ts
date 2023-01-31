import nodemailer from 'nodemailer';
import hbs, {
  NodemailerExpressHandlebarsOptions,
} from 'nodemailer-express-handlebars';
import path from 'path';

// Setup Node Mailer
const MAIL_USER = process.env['MAIL_USER'];
const MAIL_PASSWORD = process.env['MAIL_PASSWORD'];

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASSWORD,
  },
  host: 'smtp.gmail.com',
  port: 465,
});

// Config Handle bars options
const handlebarOptions: NodemailerExpressHandlebarsOptions = {
  viewEngine: {
    partialsDir: path.join(__dirname, './views'),
    defaultLayout: false,
  },
  viewPath: path.join(__dirname, './views'),
};

// Attach handler bars with nodemailer
transporter.use('compile', hbs(handlebarOptions));

export default transporter.sendMail.bind(transporter);
