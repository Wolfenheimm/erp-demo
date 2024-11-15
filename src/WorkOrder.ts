import { Recipe } from './Recipe';

// WorkOrder Interface
export interface WorkOrder {
    work_order_number: string; // Unique identifier for the work order
    recipe: Recipe; // Recipe details for the work order
}