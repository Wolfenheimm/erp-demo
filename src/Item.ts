export interface Item {
    moved_by: string; // Address (e.g., AccountId)
    sku: string; // String (max 16 bytes)
    lot_number: number;
    serial_number: number;
    abc_code: string; // Single character ('A', 'B', or 'C')
    inventory_type: string;
    product_type: string;
    qty: number;
    weight: number;
    shelf_life: number;
    cycle_count: number;
    created_at: number; // UNIX timestamp
    location: string;
  }