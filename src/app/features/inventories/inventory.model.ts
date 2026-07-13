export interface InventoryItem {
  id: number;
  name: string;
  skuCode: string;
  stockQuantity: number;
  unitPrice: number;
  totalUsageCount: number;
}

export interface CreateInventoryRequest {
  name: string;
  skuCode: string;
  stockQuantity: number;
  unitPrice: number;
}

export interface UpdateInventoryRequest extends CreateInventoryRequest {
  id: number;
}
