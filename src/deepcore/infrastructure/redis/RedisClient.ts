import IORedis from 'ioredis';


export class RedisClient {
  private static instance: RedisClient;

  private client!: IORedis;

  private host: string = '';
  private port: number = 0;

  private constructor(host: string, port: number) {
    this.host = host;
    this.port = port;
  }

  static createInstance(host: string, port: number): RedisClient {
    RedisClient.instance = new RedisClient(host, port);
    return RedisClient.instance;
  }

  static getInstance(): RedisClient {
    return RedisClient.instance;
  }

  getClient(): IORedis {
    return this.client;
  }

  async initialize(): Promise<void> {
    this.client = new IORedis({
      host: this.host,
      port: this.port,
      maxRetriesPerRequest: null
    });

    this.client.on('connect', () => {
      console.log(`[INF0] RedisClient.initialize > Conectado a Redis en ${this.host}:${this.port}`);
    });

    this.client.on('error', (error) => {
      console.log(`[ERR0] RedisClient.initialize > Error de conexión a Redis: ${error.message}`);
    });

    return Promise.resolve();
  }

  async set(key: string, value: string): Promise<void> {
    try {
      await this.client.set(key, value);

      return Promise.resolve();
    }
    catch (error) {
      return Promise.reject(new Error(error.message));
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return this.client.get(key);
    }
    catch (error) {
      return Promise.reject(new Error(error.message));
    }
  }

  async setObject(key: string, value: Object): Promise<void> {
    try {
      await this.set(key, JSON.stringify(value));
      return Promise.resolve();
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  async getObject<T>(key: string): Promise<T> {
    try {
      const data = await this.get(key);
      if (!data) {
        return Promise.resolve({} as T);
      }

      return Promise.resolve(JSON.parse(data));
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  async deleteByKey(name: string): Promise<void> {
    try {
      await this.client.del(name);

      return Promise.resolve();
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.client.flushdb();

      return Promise.resolve();
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

}

