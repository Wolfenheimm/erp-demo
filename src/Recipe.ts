// RecipeComponent Interface
export interface RecipeComponent {
    component_sku: string; // SKU of the component
    quantity: number; // Quantity required for the recipe
  }
  
  // Recipe Interface
  export interface Recipe {
    inserted_by: string; // The account that inserted this recipe
    sku: string; // The SKU of the product being created
    recipe_id: number; // Unique identifier for the recipe
    required_components: RecipeComponent[]; // List of required components
    required_equipment: string; // Equipment needed for the recipe
    output_quantity: number; // Quantity of the product to be produced
  }