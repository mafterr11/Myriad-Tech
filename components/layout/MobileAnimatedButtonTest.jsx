"use client";
import { motion } from "framer-motion";
import { useState } from "react";

const MobileAnimatedButtonTest = () => {
  const [active, setActive] = useState(false);
  return (
    <div className="flex h-screen items-center justify-center">
      <motion.button
        onClick={() => setActive(!active)}
        className="relative h-20 w-20 cursor-pointer rounded-full p-6 transition-colors hover:bg-white"
        animate={active ? "open" : "closed"}
      >
        <motion.span
          style={{
            left: "50%",
            top: "35%",
            x: "-50%",
            y: "-50%",
          }}
          variants={{
            open: {
              rotate: ["0deg", "0deg", "45deg"],
              top: ["35%", "50%", "50%"],
            },
            closed: {
              rotate: ["45deg", "0deg", "0deg"],
              top: ["50%", "50%", "35%"],
            },
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
          className="absolute h-1 w-10 bg-black"
        ></motion.span>
        <motion.span
          variants={{
            open: {
              rotate: ["0deg", "0deg", "-45deg"],
            },
            closed: {
              rotate: ["-45deg", "0deg", "0deg"],
            },
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
          style={{
            left: "50%",
            top: "50%",
            x: "-50%",
            y: "-50%",
          }}
          className="absolute h-1 w-10 bg-black"
        ></motion.span>
        <motion.span
          variants={{
            open: {
              rotate: ["0deg", "0deg", "45deg"],
              bottom: ["35%", "50%", "50%"],
              left: "50%",
            },
            closed: {
              rotate: ["45deg", "0deg", "0deg"],
              bottom: ["50%", "50%", "35%"],
              left: "calc(50% + 10px)",
            },
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
          style={{
            left: "calc(50% + 10px)",
            bottom: "35%",
            x: "-50%",
            y: "50%",
          }}
          className="absolute h-1 w-5 bg-black"
        ></motion.span>
      </motion.button>
    </div>
  );
};

export default MobileAnimatedButtonTest;
