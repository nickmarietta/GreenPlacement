import React from "react";
import { motion } from "motion/react";
import rocket from "../assets/rocket.svg";

const flameVariants = {
  initial: { scale: 1, opacity: 0.7 },
  animate: {
    scale: [1, 1.5, 1],
    opacity: [0.8, 0.3, 0.8],
    transition: {
      duration: 0.6,
      repeat: Infinity,
    },
  },
};

const RocketMarker = () => {
  return (
    <motion.div
      className="relative w-[60px] h-[90px]"
      whileHover={{ scale: 1.1, rotate: [0, 3, -3, 0] }}
      transition={{ duration: 0.4 }}
    >
      <img src={rocket} alt="Rocket" className="w-full h-full z-10 relative" />

      <motion.div
        className="absolute w-2 h-5 bg-orange-400 bottom-[-8px] left-[50%] translate-x-[-50%] rounded-full blur-sm"
        variants={flameVariants}
        initial="initial"
        animate="animate"
      />

      <motion.div
        className="absolute w-1.5 h-4 bg-yellow-400 bottom-[-6px] left-[25%] rounded-full blur-sm"
        variants={flameVariants}
        initial="initial"
        animate="animate"
      />

      <motion.div
        className="absolute w-1.5 h-4 bg-yellow-400 bottom-[-6px] right-[25%] rounded-full blur-sm"
        variants={flameVariants}
        initial="initial"
        animate="animate"
      />
    </motion.div>
  );
};

export default RocketMarker;