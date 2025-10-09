import React, { useEffect, useState } from "react";
import "./Navbar.css";

const Navbar: React.FC = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 4000); 
    return () => clearTimeout(timer); // cleanup
  }, []);

  if (!visible) return null;

  return (
    <div className="navbar">
      <p>
        🚧 This project is still under development. If you’d like to contribute, visit{" "}
        <a
          href="https://github.com/Allen-Pinto/Trackless.git"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub - Allen Pinto - Trackless Repo
        </a>
        .
      </p>
    </div>
  );
};

export default Navbar;
