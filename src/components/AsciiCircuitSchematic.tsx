import React from 'react';
import { CircuitSchematicCard } from './CircuitRenderer';

export interface AsciiCircuitSchematicProps {
  schematic: string;
  title?: string;
  className?: string;
}

/**
 * AsciiCircuitSchematic component powered by CircuitRenderer's high-contrast monospace engine.
 */
export const AsciiCircuitSchematic: React.FC<AsciiCircuitSchematicProps> = ({
  schematic,
  title = 'ASCII Circuit Schematic',
  className = '',
}) => {
  return <CircuitSchematicCard schematic={schematic} title={title} className={className} />;
};

export default AsciiCircuitSchematic;
