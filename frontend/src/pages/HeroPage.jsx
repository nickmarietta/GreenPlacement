import React from 'react';
import NebulaBG from '../components/Nebula';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import earthImg from '../assets/planet-earth.png';
import astronautImg from '../assets/astronaut.png';

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
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-t from-[#050819] to-[#2e1753]">
      <NebulaBG />

      <div
        className="absolute bottom-10 left-10 flex items-center space-x-2"
        style={{ zIndex: 30 }}
      >
        <img
          src={astronautImg}
          alt="Astronaut"
          className="w-24 animate-rotate-astronaut"
        />
        <div className="chat chat-start">
        <div className="chat-bubble chat-bubble-info">Please save the environment!</div>
      </div>
      </div>

      <img
        src={earthImg}
        alt="Earth"
        onClick={handleClick}
        className={`cursor-pointer transition-transform duration-2000 ease-in-out ${
          zoom ? 'scale-[500] z-50' : 'scale-100'
        }`}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          transformOrigin: 'center center',
          zIndex: 20,
        }}
      />

      <div className="absolute top-[10%] text-center text-white z-10 w-full">
        <h1 className="font-bold text-green-500 text-5xl">Green Placement</h1>
      </div>
    </div>
  );
};

export default HeroPage;