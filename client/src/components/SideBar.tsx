import {
  loadSessionStateFromLocalStorage,
  resetChat,
  setCurrentSessionID,
} from "@/store/agentSlice";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  clearChatHistory,
  deleteSessionFromLocalStorage,
} from "@/utils/localStorage";
import React, { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";

interface SideBarProps {
  sidebarOpen: boolean;
  isLoading: boolean;
  handleStopGenerating: () => void;
}

const capitalizeFirstLetter = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const SideBar = ({
  sidebarOpen,
  isLoading,
  handleStopGenerating,
}: SideBarProps) => {
  const dispatch = useAppDispatch();
  const startNewSession = () => {
    if (isLoading) return;
    const newSessionID = uuid();
    dispatch(setCurrentSessionID(newSessionID));
  };
  const groupedChat = useAppSelector((state) => state.agent.groupedSessions);
  const currentSessionID = useAppSelector(
    (state) => state.agent.currentSessionID
  );
  const onSelectSession = (sessionID: string) => {
    if (isLoading) return;
    dispatch(setCurrentSessionID(sessionID));
  };

  const onDeleteChat = () => {
    if (isLoading) {
      handleStopGenerating();
    }
    dispatch(resetChat());
    clearChatHistory();
  };

  const onDeleteSession = async (sessionID: string) => {
    await deleteSessionFromLocalStorage(sessionID);
    dispatch(loadSessionStateFromLocalStorage());
  };

  return (
    <div
      id="sidebar-container"
      className={`h-full border-r border-[#ffffff10] bg-[#0d0d0f] transition-all duration-300 ease-in-out absolute sm:relative z-10 ${
        sidebarOpen ? "w-[280px] left-0" : "w-0 -left-10 sm:left-0"
      }`}
    >
      {sidebarOpen && (
        <div className="opacity-100 transition-opacity duration-500 flex flex-col h-full">
          {/* Mobile Close Button - Only visible on small screens */}
          <div className="sm:hidden absolute right-3 top-3">
            <button
              className="p-2 rounded-full hover:bg-[#ffffff15]"
              onClick={(e) => {
                e.stopPropagation();
                // Logic to close sidebar
                const event = new CustomEvent("closeSidebar");
                document.dispatchEvent(event);
              }}
            >
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
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="p-3 md:p-4 flex justify-center border-b border-[#ffffff10]">
            <button
              onClick={startNewSession}
              disabled={isLoading}
              className={`w-full py-2.5 px-4 rounded-lg bg-[#ff3e3e] hover:bg-[#e03636] text-white font-medium flex items-center justify-center transition-colors ${
                isLoading ? "cursor-not-allowed opacity-70" : ""
              }`}
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
                className="mr-2"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {Object.keys(groupedChat).length > 0 ? (
              Object.keys(groupedChat).map((date, index) => (
                <div className="mb-4" key={index}>
                  <div className="text-xs text-[#ffffff60] px-2 py-1 mb-1">
                    {date}
                  </div>
                  <div className="space-y-1">
                    {groupedChat?.[date]
                      ?.slice()
                      .reverse()
                      .map(
                        (chatData: {
                          sessionID: string;
                          // eslint-disable-next-line
                          firstRequest: { key: string; value: any };
                        }) => {
                          const requestKey = chatData.firstRequest.key;
                          const parsedRequestKey = requestKey.substring(
                            0,
                            requestKey.lastIndexOf("_")
                          );
                          return (
                            <SessionItem
                              key={chatData.sessionID}
                              isLoading={isLoading}
                              onSelectSession={() => {
                                onSelectSession(chatData.sessionID);
                              }}
                              requestKey={capitalizeFirstLetter(
                                parsedRequestKey
                              )}
                              isSelected={
                                currentSessionID === chatData.sessionID
                              }
                              onDeleteSession={() => {
                                onDeleteSession(chatData.sessionID);
                              }}
                            />
                          );
                        }
                      )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-40 text-sm text-[#ffffff60]">
                No conversations yet
              </div>
            )}
          </div>

          <div className="mt-auto border-t border-[#ffffff10] p-2">
            <button
              onClick={onDeleteChat}
              className="w-full py-2 px-3 flex items-center gap-2 text-sm rounded-lg hover:bg-[#ffffff10] transition-colors"
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
                className="opacity-60"
              >
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
              <span className="text-[#ffffff90]">Clear all conversations</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SideBar;

const SessionItem = ({
  onSelectSession,
  onDeleteSession,
  requestKey,
  isLoading,
  isSelected,
}: {
  onSelectSession: () => void;
  onDeleteSession: () => void;
  requestKey: string;
  isLoading: boolean;
  isSelected: boolean;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Toggle menu
  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen((prev) => !prev);
  };

  // Close menu on clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close sidebar on mobile after selecting a session
  useEffect(() => {
    const handleSelectOnMobile = () => {
      if (window.innerWidth < 640 && isSelected) {
        // Dispatch an event that Agent.tsx can listen for
        const event = new CustomEvent("closeSidebar");
        document.dispatchEvent(event);
      }
    };

    if (isSelected) {
      handleSelectOnMobile();
    }
  }, [isSelected]);

  return (
    <div
      className={`relative flex items-center group rounded-lg ${
        isSelected ? "bg-[#1e1e22]" : "hover:bg-[#ffffff10]"
      } transition-colors`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelectSession();
        }}
        disabled={isLoading}
        className={`flex-1 w-full py-2 px-3 text-left ${
          isLoading ? "cursor-not-allowed opacity-70" : ""
        }`}
        title={
          requestKey.length > 50 ? requestKey.slice(0, 50) + "..." : requestKey
        }
      >
        <div className="flex items-center gap-2">
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
            className="opacity-60"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span
            className={`text-sm truncate max-w-[172px] text-[#ffffff90] ${
              isSelected ? "font-medium" : ""
            }`}
          >
            {requestKey}
          </span>
        </div>
      </button>

      <button
        onClick={handleMenuToggle}
        className={`p-2 mr-1 rounded-full opacity-0 group-hover:opacity-100 ${
          isMenuOpen ? "opacity-100 bg-[#ffffff20]" : ""
        } hover:bg-[#ffffff20] transition-all`}
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
          className="opacity-60"
        >
          <circle cx="12" cy="12" r="1"></circle>
          <circle cx="12" cy="5" r="1"></circle>
          <circle cx="12" cy="19" r="1"></circle>
        </svg>
      </button>

      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-1 w-48 bg-[#1e1e22] rounded-lg shadow-lg border border-[#ffffff15] overflow-hidden z-10"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteSession();
              setIsMenuOpen(false);
            }}
            className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-[#ffffff90] hover:bg-[#ffffff15] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-60"
            >
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            Delete conversation
          </button>
        </div>
      )}
    </div>
  );
};
