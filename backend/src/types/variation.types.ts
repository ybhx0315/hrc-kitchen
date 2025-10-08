import { VariationGroupType } from '@prisma/client';

/**
 * Variation Group DTO (Data Transfer Object)
 */
export interface VariationGroupDTO {
  id: string;
  menuItemId: string;
  name: string;
  type: VariationGroupType;
  required: boolean;
  displayOrder: number;
  options: VariationOptionDTO[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Variation Option DTO
 */
export interface VariationOptionDTO {
  id: string;
  variationGroupId: string;
  name: string;
  priceModifier: number;
  isDefault: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create Variation Group Input
 */
export interface CreateVariationGroupInput {
  menuItemId: string;
  name: string;
  type: VariationGroupType;
  required?: boolean;
  displayOrder?: number;
}

/**
 * Update Variation Group Input
 */
export interface UpdateVariationGroupInput {
  name?: string;
  type?: VariationGroupType;
  required?: boolean;
  displayOrder?: number;
}

/**
 * Create Variation Option Input
 */
export interface CreateVariationOptionInput {
  variationGroupId: string;
  name: string;
  priceModifier?: number;
  isDefault?: boolean;
  displayOrder?: number;
}

/**
 * Update Variation Option Input
 */
export interface UpdateVariationOptionInput {
  name?: string;
  priceModifier?: number;
  isDefault?: boolean;
  displayOrder?: number;
}

/**
 * Selected Variation (stored in OrderItem.selectedVariations JSON)
 */
export interface SelectedVariation {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  priceModifier: number;
}

/**
 * Variation Selection for Order Placement
 */
export interface VariationSelection {
  groupId: string;
  optionIds: string[]; // Array to support MULTI_SELECT
}

/**
 * Order Item with Variations (for calculation)
 */
export interface OrderItemWithVariations {
  menuItemId: string;
  quantity: number;
  basePrice: number;
  selectedVariations: SelectedVariation[];
  totalModifier: number;
  finalPrice: number;
}
