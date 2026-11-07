import { PlantIcon } from '@phosphor-icons/react';
import { getProduceImage } from '@/lib/produce';
import { cn } from '@/lib/utils';

interface ProduceImageProps {
  crop: string;
  className?: string;
  /** Size of the fallback icon in px, for crops without a scan. */
  iconSize?: number;
}

/**
 * A photo-scanned render of the crop when one exists, otherwise a neutral
 * leaf. Decorative: the crop name is always written next to it.
 */
export function ProduceImage({ crop, className, iconSize = 20 }: ProduceImageProps) {
  const src = getProduceImage(crop);
  return (
    <span aria-hidden="true" className={cn('icon-tile relative overflow-hidden', className)}>
      {src ? (
        <img src={src} alt="" loading="lazy" decoding="async" className="h-full w-full scale-90 object-contain drop-shadow-[0_2px_3px_rgb(27_31_25/0.25)]" />
      ) : (
        <PlantIcon size={iconSize} weight="duotone" className="text-leaf-700" />
      )}
    </span>
  );
}

export default ProduceImage;
