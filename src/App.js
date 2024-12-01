import React, { useState, useEffect, useCallback, useRef} from "react";
import { motion } from "framer-motion";
import { callInventoryInsertion, callCreateWorkOrder, callPrepareStagingArea, callAssembleProduct, queryInventoryByLocation } from "./polkadot";
import "./App.css";

// Work Order template used when creating a new work order
const newWorkOrder = {
  work_order_number: `${Math.floor(Math.random() * 100000)}`,
  recipe: {
    inserted_by: "bob",
    sku: "123123128",
    recipe_id: "123",
    required_components: [
      { sku: "123123125", qty: 5 },
      { sku: "123123123", qty: 5 },
    ],
    required_equipment: "Mixer",
    output_quantity: 50,
  },
};

// Basic Item template used for delivery
// Logic randomly selects an item from this list on each delivery
const ITEM_TEMPLATES = [
  {
    moved_by: "bob",
    sku: "123123123",
    abc_code: "A",
    inventory_type: "RawMaterial",
    product_type: "RawMaterials",
    qty: 3,
    weight: 5,
    shelf_life: 365,
    cycle_count: 0,
    location: "Warehouse",
  },
  {
    moved_by: "bob",
    sku: "123123125",
    abc_code: "A",
    inventory_type: "RawMaterial",
    product_type: "RawMaterials",
    qty: 3,
    weight: 5,
    shelf_life: 365,
    cycle_count: 0,
    location: "Warehouse",
  },
];

function App() {
  const [warehouse, setWarehouse] = useState([]);
  const [lotCounter, setLotCounter] = useState(1);
  const [isTruckMoving, setIsTruckMoving] = useState(false);
  const [workOrder, setWorkOrder] = useState(null);
  const [isCreatingWorkOrder, setIsCreatingWorkOrder] = useState(false);
  const warehouseRef = useRef(null);
  const [warehouseWidth, setWarehouseWidth] = useState(0);
  const stagingRef = useRef(null);
  const [stagingWidth, setStagingWidth] = useState(0);
  const [staging, setStaging] = useState([]);
  const [isPersonMoving, setIsPersonMoving] = useState(false);
  const [assemblyItems, setAssemblyItems] = useState([]); // Items for assembly
  const [isFactoryMoving, setIsFactoryMoving] = useState(false); // Animation for factory
  const assemblyRef = useRef(null);

  // Handle work order creation
  const handleCreateWorkOrder = async () => {
    setIsCreatingWorkOrder(true);

    try {
      const senderSeed = "//Alice"; // Replace with your seed/mnemonic
      await callCreateWorkOrder(senderSeed, newWorkOrder);
      setWorkOrder(newWorkOrder); // Set the current work order
    } catch (error) {
      console.error("Blockchain transaction failed:", error);
    } finally {
      setIsCreatingWorkOrder(false);
    }
  };

  // Prepare staging area
  const prepStaging = async () => {
    try {
      const senderSeed = "//Alice"; // Replace with your seed/mnemonic
      await callPrepareStagingArea(senderSeed, newWorkOrder);
      getStaging();
    } catch (error) {
      console.error("Error preparing staging area:", error);
    }
  };

  // Fetch staging inventory
  const getStaging = async () => {
    try {
      const stagingInventory = await queryInventoryByLocation();
      console.log("Raw inventory data:", stagingInventory);
  
      if (!stagingInventory) {
        console.log("No inventory found in Staging.");
        setStaging([]); // Clear the staging if no inventory is found
        return;
      }
  
    // Transform the blockchain data into the format needed for your UI
    const items = Object.keys(stagingInventory).map((serialNumber) => {
      const rawItem = stagingInventory[serialNumber];

      return {
        serial_number: parseInt(serialNumber, 10), // Ensure serial_number is a number
        moved_by: rawItem.moved_by,
        sku: rawItem.sku,
        lot_number: rawItem.lotNumber,
        abc_code: rawItem.abc_code,
        inventory_type: rawItem.inventory_type,
        product_type: rawItem.product_type,
        qty: rawItem.qty,
        weight: rawItem.weight,
        shelf_life: rawItem.shelf_life,
        cycle_count: rawItem.cycle_count,
        created_at: rawItem.created_at,
        location: rawItem.location,
      };
    });
  
      // Update the staging state with the fetched items
      setStaging(items);
  
      // Animate person movement in UI
      setIsPersonMoving(true);
      setTimeout(() => setIsPersonMoving(false), 3000);
    } catch (error) {
      console.error("Error fetching staging inventory:", error);
    }
  };

  // Stable handleDelivery function using useCallback
  const handleDelivery = useCallback(async () => {
    const randomIndex = Math.floor(Math.random() * ITEM_TEMPLATES.length);
    const template = ITEM_TEMPLATES[randomIndex];

    // Complete the item with additional data
    const newItem = {
      ...template,
      lot_number: lotCounter,
      serial_number: lotCounter + 1000,
      created_at: Math.floor(Date.now() / 1000),
    };

    try {
      const senderSeed = "//Alice"; // Alice here is used to represent the company's seed/mnemonic
      await callInventoryInsertion(senderSeed, newItem);

      setWarehouse((prev) => [...prev, newItem]);
      setLotCounter((prev) => prev + 1);

    } catch (error) {
      console.error("Blockchain transaction failed:", error);
    }
  }, [lotCounter]);

  // Simulate truck arriving periodically
  useEffect(() => {
    if (warehouseRef.current) {
      setWarehouseWidth(warehouseRef.current.offsetWidth);
    }

    // Set the staging width if the ref is available
    if (stagingRef.current) {
      setStagingWidth(stagingRef.current.offsetWidth);
    }

    // Apply the movement interval
    const interval = setInterval(() => {
      setIsTruckMoving(true);
      setTimeout(() => {
        handleDelivery(); // Deliver item
        setIsTruckMoving(false);
      }, 3000);
    }, 10000);

    return () => clearInterval(interval);
  }, [handleDelivery]);

  // Assemble items
  const handleAssembleItems = async () => {
    try {
      const senderSeed = "//Alice"; // Replace with your seed/mnemonic
      const stagingLocation = "Staging";
      const serialNumber = Math.floor(Math.random() * 100000); // Example serial number

      await callAssembleProduct(senderSeed, newWorkOrder, serialNumber, stagingLocation);

      getStaging(); // Fetch staging items
      setIsFactoryMoving(true);

      setTimeout(() => setIsFactoryMoving(false), 3000); // End animation
    } catch (error) {
      console.error("Error assembling items:", error);
    }
  };

  return (
    <div>
      {/* Work Order Section */}
      <div className="work-order">
        <h2>Current Work Order</h2>
        {workOrder ? (
          <motion.div
            className="work-order-card"
            animate={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            <p><strong>Order Number:</strong> {workOrder.work_order_number}</p>
            <p><strong>SKU:</strong> {workOrder.recipe.sku}</p>
            <p><strong>Recipe ID:</strong> {workOrder.recipe.recipe_id}</p>
          </motion.div>
        ) : (
          <button
          onClick={handleCreateWorkOrder}
          disabled={isCreatingWorkOrder}
          className="create-work-order-button"
          >
            {isCreatingWorkOrder ? "Creating..." : "Create Work Order"}
          </button>
        )}
        
      </div>
    <div className="factory">
      {/* Warehouse Section */}
      <div ref={warehouseRef} className="section warehouse">
        <h2>Warehouse</h2>
        <div className="items">
          {warehouse.map((item, index) => (
            <motion.div
              key={index}
              className="item"
              animate={{ scale: 1.2 }}
              transition={{ duration: 0.5 }}
            >
              <p>SKU: {item.sku}</p>
              <p>Lot: {item.lot_number}</p>
              <p>Created: {new Date(item.created_at * 1000).toLocaleString()}</p>
            </motion.div>
          ))}
        </div>
        {/* Truck Animation */}
        <motion.div
            className="truck"
            animate={isTruckMoving ? { x: warehouseWidth - 50 } : { x: 20 }}
            transition={{ duration: 3, ease: "easeInOut" }}
        >
        🚚
        </motion.div>
      </div>
    

      {/* Staging Area */}
      <div ref={stagingRef} className="section staging">
        <h2>Staging Area</h2>
        <div className="items">
        {staging.map((item, index) => (
          <motion.div
            key={item.serial_number || index}
            className="item"
            animate={{ scale: 1.2 }}
            transition={{ duration: 0.5 }}
          >
            <p>SKU: {item.sku}</p>
            <p>Lot: {item.lot_number}</p>
            <p>Qty: {item.qty}</p>
          </motion.div>
        ))}
        </div>
          {/* Person Animation */}
          <motion.div
            className="person"
            animate={isPersonMoving ? { x: stagingWidth - 170 } : { x: -100 }}
            transition={{ duration: 3, ease: "easeInOut" }}
          >
          🧍‍♂️
          </motion.div>

          {/* Move Materials Button */}
          <button onClick={prepStaging}>Move to Staging</button>
      </div>

      {/* Assembly Area */}
      <div ref={assemblyRef} className="section assembly">
        <h2>Assembly Area</h2>
        {workOrder && (
          <motion.div
            className="work-order-card"
            animate={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            <p><strong>Order Number:</strong> {workOrder.work_order_number}</p>
            <p><strong>SKU:</strong> {workOrder.recipe.sku}</p>
            <p><strong>Recipe ID:</strong> {workOrder.recipe.recipe_id}</p>
          </motion.div>
        )}
        <div className="items">
          {assemblyItems.map((item, index) => (
            <motion.div
              key={item.serial_number || index}
              className="item"
              animate={{ scale: 1.2 }}
              transition={{ duration: 0.5 }}
            >
              <p>SKU: {item.sku}</p>
              <p>Lot: {item.lot_number}</p>
              <p>Qty: {item.qty}</p>
            </motion.div>
          ))}
        </div>
        <motion.div
          className="factory"
          animate={isFactoryMoving ? { x: 200 } : { x: 0 }}
          transition={{ duration: 3, ease: "easeInOut" }}
        >
          🏭
        </motion.div>
        <button onClick={handleAssembleItems}>Assemble Items</button>
      </div>

    </div>    
  </div>
  );
}

export default App;
