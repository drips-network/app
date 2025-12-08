import type { Complexity } from './types/wave';

export function getPointsForComplexity(complexity: Complexity): number {
  switch (complexity) {
    case 'small':
      return 0;
    case 'medium':
      return 50;
    case 'large':
      return 100;
  }
}
