export interface Country {
  id: number;
  code: string;
  name: string;
  url: () => string;
  image: string;
  parseResponse: (response) => Promise<number>;
}