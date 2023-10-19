import React from 'react';
import Link from 'next/link';

function Navbar() {
  return (
    <nav className="bg-my-green p-4 w-full sticky top-0 z-50">
      <div className="container mx-auto">
        <ul className="flex space-x-6 md:space-x-12 items-center md:justify-start justify-center">
          <li>
            <Link href="#home" className="text-main-text">
              Home
            </Link>
          </li>
          <li>
            <Link href="#portfolio" className="text-main-text">
              Portfolio
            </Link>
          </li>
          <li>
            <Link href="#aboutme" className="text-main-text">
              About Me
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
