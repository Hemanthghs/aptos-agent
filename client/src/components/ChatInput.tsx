import { useAppSelector } from "@/store/store";
import React, { ChangeEvent, useEffect, useRef } from "react";

const ChatInput = ({
  handleInputChange,
  userInput,
  disabled,
  handleSubmit,
}: {
  userInput: string;
  handleInputChange: (value: string) => void;
  disabled: boolean;
  handleSubmit: (e: React.FormEvent) => void;
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const currentSessionID = useAppSelector(
    (state) => state.agent.currentSessionID
  );
  const currentSession = useAppSelector((state) => state.agent.currentSession);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentSessionID, currentSession]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    handleInputChange(value);

    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(
        inputRef.current.scrollHeight,
        150
      )}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // eslint-disable-next-line
      handleSubmit(e as any);

      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }
    }
  };

  return (
    <div className="relative w-full">
      <form
        onSubmit={handleSubmit}
        className={`p-3 w-full bg-[#1e1e22] rounded-xl flex items-center gap-3 transition-all duration-300 border border-[#ffffff15] ${
          disabled ? "opacity-70" : ""
        }`}
      >
        <div className="flex-1 flex items-center">
          <textarea
            ref={inputRef}
            name="user-input"
            value={userInput}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="input-box w-full bg-transparent border-none text-white outline-none placeholder:text-[#666] resize-none max-h-36 py-1"
            disabled={disabled}
            autoComplete="off"
            autoFocus={true}
            placeholder="Message Aptos Assistant..."
            rows={1}
          />
        </div>
        <button
          type="submit"
          disabled={disabled || !userInput.trim()}
          className={`flex-shrink-0 w-9 h-9 rounded-full ${
            userInput.trim()
              ? "bg-[#ff3e3e] hover:bg-[#e03636]"
              : "bg-[#3a3a3f]"
          } flex items-center justify-center transition-colors ${
            userInput.trim() ? "shadow-md" : ""
          }`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="filter brightness-0 invert transform rotate-270"
          >
            <path
              d="M12 4L4 12M12 4L20 12M12 4V20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
