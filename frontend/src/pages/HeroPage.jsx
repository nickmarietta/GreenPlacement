import React, { useState } from 'react';
import { motion } from "framer-motion"; // make sure this is correct
import { useNavigate } from 'react-router-dom';
import earthImg from '../assets/planet-earth.png';
import NebulaBackground from '../components/Nebula';

const HeroPage = () => {
  const [zoom, setZoom] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    setZoom(true);
    setTimeout(() => {
      navigate('/map');
    }, 2000);
  };

  return (
    <div>
    <NebulaBackground />
    <div className="relative w-full h-screen overflow-hidden" >
      <div className="flex items-center justify-center h-full">
        <motion.img
          src={earthImg}
          className="w-[200px] h-[200px] cursor-pointer z-20"
          initial={{ scale: 1 }}
          animate={{scale: zoom ? 20 : 1, opacity: 1}}
          transition={{ duration: 3, ease: "easeInOut" }}
          whileHover={{scale:1.5, rotateZ: 100}}
          onClick={handleClick}
        />
      </div>
      </div>

      <div className="absolute top-[10%] text-center text-white z-30 w-full">
        <h1 className="font-bold text-green-500 text-5xl">Green Placement</h1>
      </div>
    </div>
  );
};

export default HeroPage;
