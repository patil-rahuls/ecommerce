import { Product } from './product.js';

interface Cart {
  productId: Product['id'];
  qty: number;
  detail: Product;
}

export { Cart };
