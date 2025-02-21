import React, { useState } from 'react';

const CopyIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    stroke="currentColor"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CopyWithFeedback = ({ value }: { value: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="h-8 w-8 rounded-full bg-[#ffffff15] hover:bg-[#ffffff25] flex items-center justify-center transition-colors"
      >
        <CopyIcon />
      </button>
      {copied && (
        <div className="absolute right-0 top-full mt-1 text-xs py-1 px-2 bg-[#2a2a2e] rounded-md whitespace-nowrap">
          Copied to clipboard
        </div>
      )}
    </div>
  );
};

export default CopyWithFeedback;