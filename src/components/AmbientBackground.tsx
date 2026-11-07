interface AmbientBackgroundProps {
  className?: string;
  variant?: 'default' | 'vibrant' | 'subtle';
}

/**
 * The page background is the flat paper color set on <body>, so this renders
 * nothing. It stays as a component so screens that still mount it keep working.
 */
export const AmbientBackground = (_props: AmbientBackgroundProps) => null;

export default AmbientBackground;
