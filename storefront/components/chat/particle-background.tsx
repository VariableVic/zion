"use client";

import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useEffect, useState } from "react";

export function ParticleBackground() {
  const [init, setInit] = useState(false);

  // Initialize particles engine - should run only once
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });

    return () => {
      setInit(false);
    };
  }, []);

  return (
    <Particles
      id="tsparticles"
      className="absolute inset-0 h-full w-full"
      options={{
        fullScreen: { enable: false },
        background: {
          color: { value: "transparent" },
        },
        fpsLimit: 120,
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "connect",
            },
            resize: {
              enable: true,
            },
          },
          modes: {
            connect: {
              distance: 50,
              duration: 0.4,
            },
          },
        },
        particles: {
          color: {
            value: "#6d28d9",
          },
          move: {
            direction: "none",
            enable: true,
            outModes: {
              default: "bounce",
            },
            random: true,
            speed: 1,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              height: 800,
              width: 800,
            },
            value: 99,
          },
          opacity: {
            value: 0.5,
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: 1, max: 3 },
          },
        },
        detectRetina: true,
      }}
    />
  );
}
