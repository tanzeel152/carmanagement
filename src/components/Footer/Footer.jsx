"use client";

import React from "react";

const Footer = () => {
  return (
    <footer className="w-full bg-gray-800 text-white text-center p-6 mt-10  fixed  bottom-0"> 
         &copy; {new Date().getFullYear()} All Rights Reserved.
    </footer>
  );
};

export default Footer;
