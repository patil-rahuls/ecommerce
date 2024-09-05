interface Product {
  id: number;
  url: string;
  title: string;
  mrp: string;
  sellPrice: string;
  discountPercentage?: string; // Without '%' symbol
  imgThumbnail?: string;
  imgs?: string[]; // Array of Large-size image urls. 1st(least index) in this array will be the default image.
  rating?: number;
  isArchived?: boolean;
  attributes?: any;
  moq?: number;
  shipping?: number;
}

export { Product };
