import { populateTemplate } from 'solidity-codegen';

export type NFTMetadataAttributeType = 'string' | 'number' | 'boolean';

export type NFTMetadataAttribute = {
  trait_type: string;
  value: string | number | boolean;
};

export type NFTMetadata = {
  name?: string;
  description?: string;
  image?: string;
  external_url?: string;
  animation_url?: string;
  attributes?: NFTMetadataAttribute[];
};

export function populateTemplateMetadata(
  metadata: NFTMetadata,
  parameters: Record<string, string>,
): NFTMetadata {
  return {
    ...metadata,
    ...(metadata.name !== undefined && {
      name: populateTemplate(metadata.name, parameters),
    }),
    ...(metadata.description !== undefined && {
      description: populateTemplate(metadata.description, parameters),
    }),
    ...(metadata.image !== undefined && {
      image: populateTemplate(metadata.image, parameters),
    }),
    ...(metadata.external_url !== undefined && {
      external_url: populateTemplate(metadata.external_url, parameters),
    }),
    ...(metadata.animation_url !== undefined && {
      animation_url: populateTemplate(metadata.animation_url, parameters),
    }),
  };
}
