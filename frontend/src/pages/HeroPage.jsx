import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import earthImg from '../assets/planet-earth.png';
import NebulaBackground from '../components/Nebula';
import astronautImg from '../assets/astronaut.png';
const HeroPage = () => {
  const [zoom, setZoom] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    setZoom(true);
    setTimeout(() => {
      navigate('/map');
    }, 2500); // Matches animation duration
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <NebulaBackground />

      {/* Fade-to-black overlay on zoom */}
      <AnimatePresence>
        {zoom && (
          <motion.div
            className="absolute inset-0 bg-black z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          />
        )}
      </AnimatePresence>

      {/* Earth image */}
      <div className="flex items-center justify-center h-full z-30 relative">
        <motion.img
          src={earthImg}
          className="w-[200px] h-[200px] cursor-pointer"
          initial={{ scale: 1, rotateZ: 0 }}
          animate={{
            scale: zoom ? 20 : 1,
            rotateZ: zoom ? 360 : 0,
            opacity: zoom ? 0.8 : 1,
          }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
          whileHover={{ scale: 1.3, rotateZ: 20 }}
          onClick={handleClick}
        />
      </div>

      {/* Title text */}
      <motion.div
        className="absolute top-[10%] text-center text-white z-50 w-full"
        initial={{ opacity: 1 }}
        animate={{ opacity: zoom ? 0 : 1 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-7xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-500  animate-pulse">EcoNauts</h1>
      </motion.div>

      {/* Optional: add floating astronaut or rocket */}
      { 
      <motion.img
        src={astronautImg}
        className="absolute bottom-10 left-10 w-[100px] z-20"
        animate={{ y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
      /> 
      }
    </div>
  );
};

export default HeroPage;
