import React, { useMemo } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

export const PhysicsBackground = () => {
  const { scrollYProgress } = useScroll();
  const yOffset = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const rotateOffset = useTransform(scrollYProgress, [0, 1], [0, 45]);

  const stars = useMemo(() => {
    return Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 200, // Extra height for parallax
      size: Math.random() * 2 + 0.5,
      duration: Math.random() * 4 + 2,
      delay: Math.random() * 2,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#020205]">
      {/* Nebula Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-900/20 blur-[120px] rounded-full mix-blend-screen" />
      <div className="absolute bottom-[20%] right-[-5%] w-[50%] h-[50%] bg-purple-900/15 blur-[100px] rounded-full mix-blend-screen" />
      <div className="absolute top-[40%] right-[10%] w-[40%] h-[40%] bg-indigo-900/10 blur-[130px] rounded-full mix-blend-screen" />

      {/* Parallax Star Field */}
      <motion.div style={{ y: yOffset }} className="absolute inset-0">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white/40"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
            }}
            animate={{
              opacity: [0.1, 0.8, 0.1],
            }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </motion.div>

      {/* Orbiting Galaxy Core Decor */}
      <motion.div 
        style={{ rotate: rotateOffset }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20"
      >
        <div className="w-[80vw] h-[80vw] rounded-full border border-zinc-800/20 border-dashed animate-[spin_60s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full border border-zinc-700/10 border-dotted animate-[spin_45s_linear_infinite_reverse]" />
      </motion.div>
      
      {/* Floating Constants with Parallax */}
      <motion.div 
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, -150]) }}
        className="absolute inset-0 font-mono text-[10vw] font-bold text-zinc-800/10 flex items-center justify-center select-none italic"
      >
        <div className="absolute top-1/4 left-[15%]">&hbar;</div>
        <div className="absolute bottom-1/3 right-[10%]">c</div>
        <div className="absolute top-[60%] right-[20%]">G</div>
        <div className="absolute bottom-[10%] left-[5%]">&psi;</div>
      </motion.div>
    </div>
  );
};
