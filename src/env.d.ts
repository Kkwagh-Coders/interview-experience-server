// Override the default interface
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: number;
      MONGODB_URL: string;
    }
  }
}

// To make this file a module
export {};
