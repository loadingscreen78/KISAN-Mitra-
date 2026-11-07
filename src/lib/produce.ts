/**
 * Photo-scanned produce from NVIDIA SimReady Assets (CC BY 4.0), converted for
 * the web by scripts/simready. Thumbnails are 256px WebP renders; a few items
 * also ship as GLB models for the 3D scene on the landing page.
 */
const THUMB_DIR = '/models/produce/thumbs';
const MODEL_DIR = '/models/produce';

// Crop names used across the app (mandi data, crop lists) mapped to a render.
const PRODUCE_BY_NAME: Record<string, string> = {
  tomato: 'tomato',
  onion: 'onion',
  'onion big': 'onion',
  'onion small': 'onion',
  shallot: 'onion',
  potato: 'potato',
  'sweet potato': 'sweet-potato',
  capsicum: 'capsicum',
  'bell pepper': 'capsicum',
  brinjal: 'brinjal',
  eggplant: 'brinjal',
  mango: 'mango',
  'raw mango': 'mango',
  corn: 'corn',
  'baby corn': 'corn',
  maize: 'corn',
  banana: 'banana',
  'raw banana': 'banana',
  mushroom: 'mushroom',
  lemon: 'lemon',
  garlic: 'garlic',
  carrot: 'carrot',
  'bitter gourd': 'bitter-gourd',
  karela: 'bitter-gourd',
  pumpkin: 'squash',
  squash: 'squash',
  apple: 'apple',
  grape: 'grape',
  orange: 'orange',
  peach: 'peach',
  strawberry: 'strawberry',
};

export function getProduceImage(cropName: string | undefined | null): string | null {
  if (!cropName) return null;
  const slug = PRODUCE_BY_NAME[cropName.trim().toLowerCase()];
  return slug ? `${THUMB_DIR}/${slug}.webp` : null;
}

export interface ProduceModel {
  slug: string;
  url: string;
  /** Real length of the longest side in centimetres, used to keep sizes believable. */
  sizeCm: number;
}

/** Models used by the landing page scene, roughly in order of importance. */
export const PRODUCE_MODELS: ProduceModel[] = [
  { slug: 'tomato', url: `${MODEL_DIR}/tomato.glb`, sizeCm: 6.5 },
  { slug: 'brinjal', url: `${MODEL_DIR}/brinjal.glb`, sizeCm: 26 },
  { slug: 'onion', url: `${MODEL_DIR}/onion.glb`, sizeCm: 12 },
  { slug: 'capsicum', url: `${MODEL_DIR}/capsicum.glb`, sizeCm: 11 },
  { slug: 'potato', url: `${MODEL_DIR}/potato.glb`, sizeCm: 9 },
  { slug: 'mango', url: `${MODEL_DIR}/mango.glb`, sizeCm: 15 },
];

export const PRODUCE_CREDIT = {
  label: 'NVIDIA SimReady Assets',
  url: 'https://huggingface.co/datasets/nvidia/simready-assets',
  license: 'CC BY 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
};
