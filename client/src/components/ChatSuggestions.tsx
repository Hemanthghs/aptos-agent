import React from "react";

const SUGGESTIONS = [
  "What is Aptos?",
  "How do I write smart contracts on Aptos using Move?",
  "How can I deploy and mint my own fungible asset (FA) on Aptos?",
  "What are the key differences between Aptos and Ethereum/Solana?",
];

const ChatSuggestions = ({
  handleInputChange,
}: {
  handleInputChange: (value: string) => void;
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full px-4">
      {SUGGESTIONS.map((suggestion, index) => (
        <Suggestion
          key={index}
          text={suggestion}
          index={index}
          handleInputChange={handleInputChange}
        />
      ))}
    </div>
  );
};

export default ChatSuggestions;

const Suggestion = ({
  text,
  index,
  handleInputChange,
}: {
  text: string;
  index: number;
  handleInputChange: (value: string) => void;
}) => {
  // Different icon for each suggestion
  const getIcon = (index: number) => {
    switch (index % 4) {
      case 0:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#ff3e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" stroke="#ff3e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 17H12.01" stroke="#ff3e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 1:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#ff3e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="#ff3e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 13H8" stroke="#ff3e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 17H8" stroke="#ff3e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 9H9H8" stroke="#ff3e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 2:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10" stroke="#ff3e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#ff3e3e" strokeWidth="2"/>
          </svg>
        );
      case 3:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7M7 7H17" stroke="#ff3e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      onClick={() => handleInputChange(text)}
      className="border border-[#ffffff15] rounded-xl p-4 cursor-pointer hover:bg-[#1e1e22] transition-colors hover:border-[#ff3e3e33] group"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
          {getIcon(index)}
        </div>
        <p className="text-[#ffffffcc] text-sm group-hover:text-[#ffffffee] transition-colors">{text}</p>
      </div>
    </div>
  );
};