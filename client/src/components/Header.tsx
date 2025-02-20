import React from "react";

interface HeaderProps {
  username?: string;
  logo?: string;
}

const Header = ({ username = "User" }: HeaderProps) => {
  return (
    <div className="flex flex-col items-center gap-6 mt-20 mb-12">
      <div className="w-16 h-16 bg-[#ff3e3e] rounded-full flex items-center justify-center shadow-lg">
        {/* Bot Icon SVG */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter brightness-0 invert"
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.1 6 14 6.9 14 8C14 9.1 13.1 10 12 10C10.9 10 10 9.1 10 8C10 6.9 10.9 6 12 6ZM18 16.58C17.16 17.76 14.77 19 12 19C9.23 19 6.84 17.76 6 16.58C5.96 15.22 9.4 14 12 14C14.6 14 18.04 15.22 18 16.58Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-xl font-medium tracking-wide">
          Welcome, {username}
        </h2>
        <p className="text-[#ffffffaa] text-lg md:text-2xl text-center font-light">
          How can I assist you today?
        </p>
      </div>
    </div>
  );
};

export default Header;
