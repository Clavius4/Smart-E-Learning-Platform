import { Ilabu, Namba, Helufi } from './images';

export interface TopProduct {
  id: number | string;
  image: string;
  title: string;
  price: string;
  rating: number;
  link: string;
}

export const topProductsData: TopProduct[] = [
  {
    id: 1,
    image: Ilabu,
    title: 'Kusoma ilabu',
    price: '87+ students',
    rating: 4,
    link: '#!',
  },
  {
    id: 2,
    image: Namba,
    title: 'Kuhesabu namba',
    price: '59+ students',
    rating: 4,
    link: '#!',
  },
  {
    id: 3,
    image: Helufi,
    title: 'Kuunganisha Herufi',
    price: '89+ students',
    rating: 4,
    link: '#!',
  },
];
