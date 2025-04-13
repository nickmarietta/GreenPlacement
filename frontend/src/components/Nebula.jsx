import { ReactNebula } from "@flodlc/nebula";

const NebulaBG = () => {
   return (
       <>
           <ReactNebula config={{
                "starsCount": 500,
                "starsColor": "#FFFFFF",
                "starsRotationSpeed": 8.3,
                "cometFrequence": 72,
                "nebulasIntensity": 0,
                "bgColor": "rgb(8,8,8)",
                "sunScale": 0,
                "planetsScale": 0,
                "solarSystemOrbite": 0,
                "solarSystemSpeedOrbit": 0
            }}/>
       </>
   );
}

export default NebulaBG;