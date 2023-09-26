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
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      AI_API_TOKEN_HUGGING_FACE: string;
    }
  }
}

// To make this file a module
export {};
