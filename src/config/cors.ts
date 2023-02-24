// Setting dynamic origins
const corsOriginWhitelist = [process.env['CLIENT_BASE_URL']];

type StaticOrigin = boolean | string | RegExp | (boolean | string | RegExp)[];
const corsOptionForCredentials = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, origin?: StaticOrigin | undefined) => void,
  ) {
    if (origin && corsOriginWhitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  credentials: true,
};

export default corsOptionForCredentials;
