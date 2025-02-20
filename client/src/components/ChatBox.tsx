import React, { useEffect, useRef } from "react";
import ChatInput from "./ChatInput";
import ChatSuggestions from "./ChatSuggestions";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import CopyWithFeedback from "./CopyWithFeedback";
import { useAppSelector } from "@/store/store";
import Header from "./Header";

interface ChatBoxProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
  toggleAgent: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleInputChange: (value: string) => void;
  userInput: string;
  disabled: boolean;
  isNew: boolean;
  showStopOption: boolean;
  handleStopGenerating: () => void;
}

const ChatBox = ({
  toggleSidebar,
  sidebarOpen,
  toggleAgent,
  handleInputChange,
  handleSubmit,
  userInput,
  disabled,
  isNew,
  showStopOption,
  handleStopGenerating,
}: ChatBoxProps) => {
  const currentSession = useAppSelector((state) => state.agent.currentSession);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom whenever currentSession.requests updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentSession?.requests]);

  // Listen for sidebar close events
  useEffect(() => {
    const handleCloseSidebarEvent = () => {
      toggleSidebar();
    };

    document.addEventListener("closeSidebar", handleCloseSidebarEvent);

    return () => {
      document.removeEventListener("closeSidebar", handleCloseSidebarEvent);
    };
  }, [toggleSidebar]);

  return (
    <div className="flex-1 w-full h-full flex flex-col">
      <header className="flex items-center justify-between px-3 md:px-4 py-3 border-b border-[#ffffff10]">
        <div className="flex items-center gap-2 md:gap-4">
          {isNew ? null : (
            <button
              id="sidebar-toggle"
              onClick={toggleSidebar}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#ffffff10] transition-colors"
            >
              {sidebarOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              )}
            </button>
          )}
          <h1 className="text-base md:text-lg font-semibold text-white">
            AI Assistant
          </h1>
        </div>
        <button
          onClick={toggleAgent}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#ffffff10] transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto py-3 md:py-4 px-3 md:px-6">
        {currentSession && Object.keys(currentSession?.requests).length > 0 ? (
          <div className="flex flex-col gap-4 md:gap-6 max-w-[750px] mx-auto">
            {Object.entries(currentSession.requests).map(([key, value]) => {
              const parsedKey = key.substring(0, key.lastIndexOf("_"));
              return (
                <React.Fragment key={key}>
                  <UserChat content={parsedKey} />
                  <BotChat status={value.status} content={value.result} />
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef}></div>
          </div>
        ) : (
          <div className="flex h-full flex-col justify-between items-center pb-10">
            <Header />
            <div className="w-full max-w-4xl px-4 mb-6">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-[#ffffff22] to-transparent mb-10"></div>
            </div>
            <ChatSuggestions handleInputChange={handleInputChange} />
          </div>
        )}
      </div>

      <div className="px-3 md:px-4 pb-3 md:pb-4 pt-2 border-t border-[#ffffff10]">
        <div className="max-w-[750px] mx-auto">
          {showStopOption && (
            <div className="flex justify-center mb-3">
              <button
                onClick={handleStopGenerating}
                className="flex items-center gap-2 py-1.5 px-3 bg-[#2a2a2e] hover:bg-[#3a3a3f] rounded-full text-sm text-[#ffffffcc] transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                </svg>
                <span>Stop Generating</span>
              </button>
            </div>
          )}
          <ChatInput
            handleInputChange={handleInputChange}
            disabled={disabled}
            userInput={userInput}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatBox;

const UserChat = ({ content }: { content: string }) => {
  return (
    <div className="flex justify-end">
      <div className="bg-[#1e1e22] rounded-xl w-fit max-w-[90%] sm:max-w-[80%] p-3 md:p-4 shadow-sm">
        <DisplayMarkdown content={content} />
      </div>
    </div>
  );
};

const BotChat = ({ content, status }: { content: string; status: string }) => {
  return (
    <div className="flex gap-2 md:gap-3 items-start">
      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#ff3e3e] flex items-center justify-center shrink-0 mt-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2v20M2 5h20M2 17h20M2 11h8M14 11h8"></path>
        </svg>
      </div>
      <div className="space-y-2 max-w-[90%]">
        {status === "pending" ? (
          <div className="bg-[#1e1e22] p-3 md:p-4 rounded-xl animate-pulse">
            <span className="text-[#ffffff80]">
              Thinking
              <span className="dots-loader"></span>{" "}
            </span>
          </div>
        ) : (
          <div className="bg-[#1e1e22] p-3 md:p-4 rounded-xl relative group">
            <div className="text-[14px] md:text-[16px] font-light">
              <DisplayMarkdown content={content} />
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyWithFeedback value={content} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DisplayMarkdown = ({ content }: { content: string }) => {
  return (
    <div
      className="chat-markdown"
      style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
    >
      <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{content}</ReactMarkdown>
    </div>
  );
};
