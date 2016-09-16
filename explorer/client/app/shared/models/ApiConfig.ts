/* tslint:disable */

export interface ApiConfigInterface {
  name: string;
  public: boolean;
  description?: string;
  entry: string;
  methods: Array<string>;
  plugins?: any;
  id?: number;
}

export class ApiConfig implements ApiConfigInterface {
  name: string;
  public: boolean;
  description: string;
  entry: string;
  methods: Array<string> = ["GET", "POST"];
  plugins: Array<any> = [];
  id: number;
  constructor(instance?: ApiConfig) {
    Object.assign(this, instance);
  }
}
