const shell = require('shelljs');

// Copy all views to build
shell.cp('-R', 'src/views', 'build/');

// Copy all public files
shell.cp('-R', 'src/public', 'build/');

// Copy the mail views
shell.cp('-R', 'src/services/mail/views', 'build/services/mail/');
