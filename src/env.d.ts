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
      SERVER_BASE_URL: string;
      MONGODB_BACKUP_URL: string;
      DB_NAME: string;
      BACKUP_TIME: string;
    }
  }
}

// To make this file a module
export {};
