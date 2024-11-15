import React, { useState } from "react";
import { motion } from "framer-motion";
import Truck from "./truck";
import "./App.css";

function App() {
  const [warehouse, setWarehouse] = useState([]);
  const [staging, setStaging] = useState([]);
  const [producedItems, setProducedItems] = useState([]);

  const handleDelivery = () => {
    const newItems = Array.from({ length: 5 }, (_, i) => `Item-${Math.floor(Math.random() * 1000)}`);
    setWarehouse((prev) => [...prev, ...newItems]);
  };

  const moveToStaging = () => {
    if (warehouse.length > 0) {
      const item = warehouse[0];
      setWarehouse((prev) => prev.slice(1));
      setStaging((prev) => [...prev, item]);
    }
  };

  const produceItem = () => {
    if (staging.length > 0) {
      const item = staging[0];
      setStaging((prev) => prev.slice(1));
      setProducedItems((prev) => [...prev, `Produced-${item}`]);
    }
  };

  const moveToWarehouse = () => {
    if (producedItems.length > 0) {
      const item = producedItems[0];
      setProducedItems((prev) => prev.slice(1));
      setWarehouse((prev) => [...prev, item]);
    }
  };

  return (
    <div className="factory">
      {/* Truck for delivering items */}
      <Truck onDeliver={handleDelivery} />

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
              {item}
            </motion.div>
          ))}
        </div>
        <button onClick={moveToStaging}>Move to Staging</button>
      </div>

      <div className="section staging">
        <h2>Staging Area</h2>
        <div className="items">
          {staging.map((item, index) => (
            <motion.div
              key={index}
              className="item"
              animate={{ rotate: 360 }}
              transition={{ duration: 1 }}
            >
              {item}
            </motion.div>
          ))}
        </div>
        <button onClick={produceItem}>Produce Item</button>
      </div>

      <div className="section production">
        <h2>Production Line</h2>
        <div className="items">
          {producedItems.map((item, index) => (
            <motion.div
              key={index}
              className="item"
              animate={{ y: 20 }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              {item}
            </motion.div>
          ))}
        </div>
        <button onClick={moveToWarehouse}>Move to Warehouse</button>
      </div>
    </div>
  );
}

export default App;

// import React, { useEffect, useState } from 'react';
// import { connectToBlockchain, callInventoryInsertion } from './polkadot';

// function App() {
//   const [blockNumber, setBlockNumber] = useState(null);

//   const [item] = useState({
//     moved_by: 'bob',
//     sku: '123123123',
//     lot_number: 1,
//     serial_number: 1001,
//     abc_code: 'A',
//     inventory_type: 'finishedgood',
//     product_type: 'capitalgoods',
//     qty: 10,
//     weight: 5,
//     shelf_life: 365,
//     cycle_count: 0,
//     created_at: Math.floor(Date.now() / 1000),
//     location: 'Warehouse',
//   });

//   const [status, setStatus] = useState('');

//   async function handleSubmit() {
//     try {
//       setStatus('Processing...');
//       const senderSeed = '//Alice'; // Replace with your sender's seed phrase
//       const result = await callInventoryInsertion(senderSeed, item);
//       setStatus(`Transaction successful: ${result}`);
//     } catch (error) {
//       setStatus(`Transaction failed: ${error.message}`);
//     }
//   }

//   useEffect(() => {
//     async function fetchBlockNumber() {
//       const api = await connectToBlockchain();
//       const lastHeader = await api.rpc.chain.getHeader();
//       setBlockNumber(lastHeader.number.toHuman());
//     }

//     fetchBlockNumber().catch(console.error);
//   }, []);

//   return (
//     <div>
//       <h1>Latest Block Number</h1>
//       {blockNumber ? <p>{blockNumber}</p> : <p>Loading...</p>}

//       <h1>Inventory Insertion</h1>
//       <button onClick={handleSubmit}>Insert Item</button>
//       <p>{status}</p>
//     </div>
//   );
// }

// export default App;
