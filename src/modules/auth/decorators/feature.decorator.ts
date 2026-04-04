import { SetMetadata } from '@nestjs/common';

export const Feature = (...features: string[]) => SetMetadata('features', features);