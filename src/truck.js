import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

function Truck({ onDeliver }) {
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsMoving(true); // Trigger the truck's animation
      setTimeout(() => {
        onDeliver(); // Deliver items to the warehouse
        setIsMoving(false); // Reset truck position
      }, 200); // Time for the truck to reach the warehouse
    }, 300); // Truck comes every 3 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [onDeliver]);

  return (
    <motion.div
      className="truck"
      animate={isMoving ? { x: 300 } : { x: 0 }} // Moves truck to the warehouse
      transition={{ duration: 3, ease: "easeInOut" }}
    >
      🚚
    </motion.div>
  );
}

export default Truck;