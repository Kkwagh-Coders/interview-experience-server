// Override the default interface
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: number;
      MONGODB_URL: string;
      SECRET_KEY: string;
      MAIL_USER: string;
      MAIL_PASSWORD: string;
      CLIENT_BASE_URL: string;
    }
  }
}

// To make this file a module
export {};
