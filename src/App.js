import React, { useState, useEffect, useCallback, useRef} from "react";
import { motion } from "framer-motion";
import { callInventoryInsertion, callCreateWorkOrder } from "./polkadot";
import "./App.css";

const ITEM_TEMPLATES = [
  {
    moved_by: "bob",
    sku: "123123123",
    abc_code: "A",
    inventory_type: "RawMaterial",
    product_type: "RawMaterials",
    qty: 10,
    weight: 5,
    shelf_life: 365,
    cycle_count: 0,
    location: "Warehouse",
  },
  {
    moved_by: "bob",
    sku: "123123124",
    abc_code: "A",
    inventory_type: "RawMaterial",
    product_type: "RawMaterials",
    qty: 10,
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
    qty: 10,
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

  // Handle work order creation
  const handleCreateWorkOrder = async () => {
    setIsCreatingWorkOrder(true);

    const newWorkOrder = {
      work_order_number: `${Math.floor(Math.random() * 100000)}`,
      recipe: {
        inserted_by: "bob",
        sku: "123123123",
        recipe_id: Math.floor(Math.random() * 1000),
        required_components: [
          { component_sku: "COMP-001", quantity: 10 },
          { component_sku: "COMP-002", quantity: 5 },
        ],
        required_equipment: "Mixer",
        output_quantity: 50,
      },
    };

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

  // Handle staging material collection
  const moveToStaging = () => {
    if (warehouse.length > 0) {
      const [item, ...rest] = warehouse;
      setWarehouse(rest); // Remove item from warehouse
      setStaging((prev) => [...prev, item]); // Add item to staging

      // Animate person movement
      setIsPersonMoving(true);
      setTimeout(() => setIsPersonMoving(false), 3000);
    }
  };

  // Stable handleDelivery function using useCallback
  const handleDelivery = useCallback(async () => {
    const randomIndex = Math.floor(Math.random() * ITEM_TEMPLATES.length);
    const template = ITEM_TEMPLATES[randomIndex];

    const newItem = {
      ...template,
      lot_number: lotCounter,
      serial_number: lotCounter + 1000,
      created_at: Math.floor(Date.now() / 1000),
    };

    try {
      const senderSeed = "//Alice"; // Replace with your seed/mnemonic
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

    if (stagingRef.current) {
      setStagingWidth(stagingRef.current.offsetWidth);
    }

    const interval = setInterval(() => {
      setIsTruckMoving(true);
      setTimeout(() => {
        handleDelivery(); // Deliver item
        setIsTruckMoving(false);
      }, 3000);
    }, 10000);

    return () => clearInterval(interval);
  }, [handleDelivery]);

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
              key={index}
              className="item"
              animate={{ scale: 1.2 }}
              transition={{ duration: 0.5 }}
            >
              <p>SKU: {item.sku}</p>
              <p>Lot: {item.lot_number}</p>
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
          <button onClick={moveToStaging}>Move to Staging</button>
      </div>
    </div>    
  </div>
  );
}

export default App;
