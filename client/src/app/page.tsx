"use client";

import Agent from "@/components/Agent";
import { DisplayMarkdown } from "@/components/ChatBox";
import { toggleAgentDialog } from "@/store/agentSlice";
import { useAppDispatch } from "@/store/store";
import React, { useEffect, useState } from "react";

const Page = () => {
  const dispatch = useAppDispatch();
  const [animationClass, setAnimationClass] = useState("");

  useEffect(() => {
    setAnimationClass("opacity-100 translate-y-0");
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#121214] to-[#09090b] p-4 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 left-1/3 w-72 h-72 bg-[#ff3e3e] rounded-full opacity-5 blur-3xl"></div>
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-[#ff3e3e] rounded-full opacity-5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ffffff20] to-transparent"></div>
      </div>

      <div
        className={`text-center max-w-2xl mx-auto mb-12 transition-all duration-1000 transform opacity-0 translate-y-4 ${animationClass}`}
      >
        <div className="relative">
          <div className="w-24 h-24 bg-[#ff3e3e] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-[#ff3e3e20] relative z-10 animate-pulse">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="filter brightness-0 invert"
            >
              <path d="M12 2a7 7 0 0 1 7 7v1.5a1.5 1.5 0 0 1-3 0V9A4 4 0 1 0 8 9v8h8a4 4 0 0 0 2.11-7.41"></path>
              <path d="M10 10.5a1.5 1.5 0 0 1-3 0V9a7 7 0 0 1 7-7"></path>
              <path d="M6 9v12"></path>
              <path d="M18 16.5a1.5 1.5 0 0 1-3 0"></path>
            </svg>
          </div>
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-36 h-36 rounded-full border border-[#ffffff10] animate-ping opacity-20"></div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-[#ffffffaa]">
          Aptos Assistant
        </h1>
        <p className="text-[#ffffffcc] text-xl mb-10 leading-relaxed">
          Your personal blockchain and development guide, available 24/7
        </p>

        <div className="relative">
          <button
            onClick={() => dispatch(toggleAgentDialog())}
            className="group bg-[#ff3e3e] hover:bg-[#e03636] text-white font-medium py-4 px-10 rounded-xl transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-[#ff3e3e30] flex items-center justify-center mx-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-3 group-hover:animate-bounce"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Start Chatting
          </button>
          <span className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-[#ffffff70] text-sm mt-4 opacity-80">
            Powered by advanced AI technology
          </span>
        </div>
      </div>

      {/* Testimonial/Feature section */}
      <div
        className={`mt-20 max-w-xl text-center transition-all duration-1000 delay-300 transform opacity-0 translate-y-4 ${animationClass}`}
      >
        <div className="flex space-x-6 justify-center mb-8">
          {["Fast responses", "Blockchain expertise", "Code examples"].map(
            (feature, i) => (
              <div key={i} className="flex items-center text-[#ffffffaa]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ff3e3e"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>{feature}</span>
              </div>
            )
          )}
        </div>

        <div className="px-6 py-5 bg-[#ffffff0a] rounded-xl border border-[#ffffff10]">
          <p className="text-[#ffffffdd] italic text-lg">
            &quot;Ask me anything about blockchain development, smart contracts,
            or web3 technologies. I&apos;m here to help you build the
            future.&quot;
          </p>
        </div>
      </div>

      <Agent />
    </div>
  );
};

export default Page;
