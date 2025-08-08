import React from "react";
// Importing icons from FontAwesome for social media links
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faFacebook,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import pic from "../assets/pic1.jpg";
import { motion } from "motion/react"; // Importing motion library for animation

const About = () => {
  return (
    // Animated container with motion library for page entrance effect
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      transition={{ duration: 1.5 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
    >
      <div className="p-4 sm:p-6 about container mx-auto max-w-4xl">
        {/* Page title */}
        <h2 className="text-2xl sm:text-3xl font-medium mb-4 text-slate-700 text-center">
          Welcome to Vinkid Beatz!
        </h2>
        
        {/* Profile picture with responsive sizing */}
        <img
          src={pic}
          alt="Vinkid Beatz"
          className="rounded-full w-40 h-40 sm:w-56 sm:h-56 mb-4 mx-auto object-cover"
        />
        
        {/* About section with responsive text sizing */}
        <div className="space-y-4 text-center px-4">
          <p className="text-black text-base sm:text-lg lg:text-xl">
            Hi, I'm Vinkid Beatz, a 22-year-old music producer from South Africa,
            Cape Town. This is your ultimate destination for high-quality,
            professionally crafted beats designed to inspire creativity and take
            your projects to the next level.
          </p>
          <p className="text-black text-base sm:text-lg lg:text-xl">
            Whether you're an artist, content creator, or filmmaker, I've got the
            perfect sound for you. From versatile styles to top-tier
            quality, my beats are created with passion and precision to meet your
            unique needs.
          </p>
          <p className="text-black text-base sm:text-lg lg:text-xl">
            Let's make magic together—explore the world of Vinkid Beatz today!
          </p>
        </div>
        
        {/* Social media links section with icons */}
        <div className="flex justify-center mt-6 space-x-6">
          <a
            href="https://www.instagram.com/vinkid_beatz/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-950 hover:text-blue-700 transition duration-300"
          >
            <FontAwesomeIcon icon={faInstagram} size="2x" />
          </a>
          <a
            href="https://web.facebook.com/vinkidbeatz/?_rdc=1&_rdr#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-950 hover:text-blue-700 transition duration-300"
          >
            <FontAwesomeIcon icon={faFacebook} size="2x" />
          </a>
          <a
            href="https://www.youtube.com/@vinkidbeatz."
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-950 hover:text-blue-700 transition duration-300"
          >
            <FontAwesomeIcon icon={faYoutube} size="2x" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};
export default About;
