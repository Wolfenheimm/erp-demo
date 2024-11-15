import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { callInventoryInsertion } from "./polkadot";
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

  // Stable handleDelivery function using useCallback
  const handleDelivery = useCallback(async () => {
    const randomIndex = Math.floor(Math.random() * ITEM_TEMPLATES.length);
    const template = ITEM_TEMPLATES[randomIndex];

    const newItem = {
      ...template,
      lot_number: lotCounter,
      created_at: Math.floor(Date.now() / 1000),
    };

    try {
      const senderSeed = "//Alice"; // Replace with your seed/mnemonic
      await callInventoryInsertion(senderSeed, newItem);

      setWarehouse((prev) => [newItem, ...prev]);
      setLotCounter((prev) => prev + 1);
    } catch (error) {
      console.error("Blockchain transaction failed:", error);
    }
  }, [lotCounter]);

  // Simulate truck arriving periodically
  useEffect(() => {
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
    <div className="factory">
      <div className="section warehouse">
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
      </div>
      <div>
        <motion.div
          className="truck"
          animate={isTruckMoving ? { x: 400 } : { x: 0 }}
          transition={{ duration: 3, ease: "easeInOut" }}
        >
          🚚
        </motion.div>
      </div>
    </div>
    
  );
}

export default App;
