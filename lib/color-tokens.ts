import type { ColorScale } from './types'

export const COLOR_SCALES: ColorScale[] = [
  {
    name: 'Primary',
    tokens: [
      { name: '50', hex: '#EAF2FF' },
      { name: '100', hex: '#D4E5FF' },
      { name: '200', hex: '#BFD7FF' },
      { name: '300', hex: '#A9CAFF' },
      { name: '400', hex: '#7EB0FF' },
      { name: '500', hex: '#5495FF' },
      { name: '600', hex: '#277AFF' },
      { name: '700', hex: '#0050E6' },
      { name: '800', hex: '#002D9C' },
      { name: '900', hex: '#002D76' },
    ],
  },
  {
    name: 'Grey',
    tokens: [
      { name: '50', hex: '#FAFAFA' },
      { name: '100', hex: '#F4F4F4' },
      { name: '200', hex: '#E9E9E9' },
      { name: '300', hex: '#DFDFDF' },
      { name: '400', hex: '#CACACA' },
      { name: '500', hex: '#989898' },
      { name: '600', hex: '#6F6F6F' },
      { name: '700', hex: '#525252' },
      { name: '800', hex: '#393939' },
      { name: '900', hex: '#161616' },
    ],
  },
  {
    name: 'Connectivity Green',
    description: 'Giga connectivity green scale (status: connected)',
    tokens: [
      { name: '50', hex: '#D6FFE9' },
      { name: '100', hex: '#ADFFD2' },
      { name: '200', hex: '#85FFBC' },
      { name: '300', hex: '#5CFFA5' },
      { name: '400', hex: '#33FF8F' },
      { name: '500', hex: '#0AFF78' },
      { name: '600', hex: '#00D661' },
      { name: '700', hex: '#00B853' },
      { name: '800', hex: '#008F40' },
      { name: '900', hex: '#00662E' },
    ],
  },
  {
    name: 'Connectivity Red',
    description: 'Giga destructive / not connected',
    tokens: [{ name: 'Base', hex: '#ED1C24' }],
  },
  {
    name: 'Connectivity',
    tokens: [
      { name: 'Green 600', hex: '#00D661' },
      { name: 'Yellow 600', hex: '#FFC93D' },
      { name: 'Red 600', hex: '#ED1C24' },
    ],
  },
]

export function getColorTokens() {
  return COLOR_SCALES
}

export function getPrimaryColor600() {
  return '#277AFF'
}
