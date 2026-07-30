export interface ColorPalette {
  name: string;
  imageUrl: string;
  wall: string;
  roof: string;
  trim: string;
  door: string;
  accent: string;
}

export const PALETTES: ColorPalette[] = [
  {
    name: 'Warm Beige',
    imageUrl: '/houses/warm-beige.png',
    wall: '#D4C2BA',
    roof: '#1A191A',
    trim: '#D1BDAA',
    door: '#29272D',
    accent: '#AC8A70',
  },
  {
    name: 'Lavender Mist',
    imageUrl: '/houses/lavender-mist.png',
    wall: '#BBC0DC',
    roof: '#273141',
    trim: '#9FB5DA',
    door: '#49455C',
    accent: '#A89EB0',
  },
  {
    name: 'Golden Earth',
    imageUrl: '/houses/golden-earth.png',
    wall: '#CDB9B8',
    roof: '#1E1716',
    trim: '#C89145',
    door: '#3E322D',
    accent: '#AB7B57',
  },
  {
    name: 'Urban Grey',
    imageUrl: '/houses/urban-grey.png',
    wall: '#BBB6BF',
    roof: '#040406',
    trim: '#43424D',
    door: '#4E5163',
    accent: '#403F45',
  },
  {
    name: 'Taupe Stone',
    imageUrl: '/houses/taupe-stone.png',
    wall: '#C2B8B4',
    roof: '#181819',
    trim: '#B9A996',
    door: '#655662',
    accent: '#706B59',
  },
  {
    name: 'Terracotta',
    imageUrl: '/houses/terracotta.png',
    wall: '#947265',
    roof: '#2F1E1B',
    trim: '#CA8166',
    door: '#61564C',
    accent: '#A65D46',
  },
  {
    name: 'Navy Slate',
    imageUrl: '/houses/navy-slate.png',
    wall: '#968B84',
    roof: '#0A0B0F',
    trim: '#252B3B',
    door: '#3C3D4B',
    accent: '#1C2232',
  },
  {
    name: 'Dark Espresso',
    imageUrl: '/houses/dark-espresso.png',
    wall: '#2C1D17',
    roof: '#100E0D',
    trim: '#524339',
    door: '#6C6268',
    accent: '#664E3F',
  },
];
