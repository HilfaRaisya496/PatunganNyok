export interface SplitItem {
  id: string;
  name: string;
  price: number;
}

export interface Person {
  id: string;
  name: string;
  items: SplitItem[];
}
