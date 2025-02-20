import Image from 'next/image';
import React, { useState } from 'react';

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
        <Image
          src="/interchain-agent/copy-icon.svg"
          height={16}
          width={16}
          alt="Copy"
          className="filter brightness-0 invert opacity-70"
        />
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