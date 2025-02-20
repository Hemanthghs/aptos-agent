import {
  addSessionItem,
  loadSessionStateFromLocalStorage,
  setCurrentSession,
  setCurrentSessionID,
  toggleAgentDialog,
} from "@/store/agentSlice";
import { useAppDispatch, useAppSelector } from "@/store/store";
import React, { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import SideBar from "./SideBar";
import ChatBox from "./ChatBox";
import { AGENT_BACKEND_URL } from "@/utils/constants";

const Agent = () => {
  const dispatch = useAppDispatch();

  const agentDialogOpen = useAppSelector((state) => state.agent.agentOpen);
  const currentSessionID = useAppSelector(
    (state) => state.agent.currentSessionID
  );
  const groupedChat = useAppSelector((state) => state.agent.groupedSessions);
  const isNew = Object.keys(groupedChat).length === 0;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userInput, setUserInput] = useState("");
  const [chatInputTime, setChatInputTime] = useState<string>("");
  console.log(chatInputTime);
  const [inputDisabled, setInputDisabled] = useState<boolean>(false);

  // const resetInputState = () => {
  //   setUserInput("");
  //   setInputDisabled(false);
  // };

  // const dispatchSessionItem = (
  //   userInput: string,
  //   status: string,
  //   result: string,
  //   errMessage: string
  // ) => {
  //   dispatch(
  //     addSessionItem({
  //       request: {
  //         [userInput]: {
  //           errMessage,
  //           result,
  //           status,
  //           date: chatInputTime,
  //         },
  //       },
  //       sessionID: currentSessionID,
  //     })
  //   );
  // };

  const abortControllerRef = useRef<AbortController | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputDisabled(true);
    const currentDate = new Date().toISOString();
    setChatInputTime(currentDate);

    if (userInput.trim() !== "") {
      // Reset the abort controller before starting a new request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create a new AbortController and store it in the ref
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      const signal = abortController.signal;

      setInputDisabled(true);

      dispatch(
        addSessionItem({
          sessionID: currentSessionID,
          request: {
            [userInput]: {
              errMessage: "",
              result: "",
              status: "pending",
              date: currentDate,
            },
          },
        })
      );

      try {
        setUserInput("");
        const response = await fetch(`${AGENT_BACKEND_URL}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userInput,
          }),
          signal,
        });

        const data = await response.json();

        if (response.ok) {
          dispatch(
            addSessionItem({
              request: {
                [userInput]: {
                  errMessage: "",
                  result: data.response.replace(/^"(.*)"$/, '$1'),
                  status: "success",
                  date: currentDate,
                },
              },
              sessionID: currentSessionID,
            })
          );
        } else {
          dispatch(
            addSessionItem({
              request: {
                [userInput]: {
                  errMessage: "Error processing request.",
                  result: "Error processing request.",
                  status: "failed",
                  date: currentDate,
                },
              },
              sessionID: currentSessionID,
            })
          );
        }
      } catch (error) {
        if (signal.aborted) {
          dispatch(
            addSessionItem({
              request: {
                [userInput]: {
                  errMessage: "Request cancelled",
                  result: "Request cancelled",
                  status: "failed",
                  date: currentDate,
                },
              },
              sessionID: currentSessionID,
            })
          );
        } else {
          const message =
            error instanceof Error ? error.message : `unknown error ${error}`;
          console.error("Failed to send message:", message);
          const eMsg = "Agent is offline or request failed.";

          dispatch(
            addSessionItem({
              request: {
                [userInput]: {
                  errMessage: eMsg,
                  result: eMsg,
                  status: "failed",
                  date: currentDate,
                },
              },
              sessionID: currentSessionID,
            })
          );
        }
      } finally {
        abortControllerRef.current = null;
        setInputDisabled(false);
      }
    }
  };

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleInputChange = (value: string) => {
    setUserInput(value);
  };

  // Add click outside handler to close sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only handle on mobile screens
      if (window.innerWidth < 640 && sidebarOpen) {
        const sidebarElement = document.getElementById("sidebar-container");
        const toggleButton = document.getElementById("sidebar-toggle");

        if (
          sidebarElement &&
          !sidebarElement.contains(event.target as Node) &&
          toggleButton &&
          !toggleButton.contains(event.target as Node)
        ) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (agentDialogOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [agentDialogOpen]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const toggleAgent = () => {
    dispatch(toggleAgentDialog());
  };

  useEffect(() => {
    if (agentDialogOpen) {
      // Auto-close sidebar on mobile when dialog opens
      if (window.innerWidth < 640) {
        setSidebarOpen(false);
      }

      const newSessionID = uuid();
      dispatch(setCurrentSessionID(newSessionID));
      setUserInput("");
      setInputDisabled(false);
    }
  }, [agentDialogOpen, dispatch]);

  useEffect(() => {
    if (currentSessionID) {
      setUserInput("");
      setInputDisabled(false);
      const storedState = localStorage.getItem("queries");
      if (storedState) {
        const parsed = JSON.parse(storedState);
        if (parsed[currentSessionID]) {
          dispatch(setCurrentSession({ data: parsed }));
          dispatch(
            setCurrentSession({
              data: parsed[currentSessionID],
            })
          );
        } else {
          dispatch(
            setCurrentSession({
              data: {
                date: new Date().toISOString(),
                requests: {},
              },
            })
          );
        }
      } else {
        dispatch(
          setCurrentSession({
            data: {
              date: new Date().toISOString(),
              requests: {},
            },
          })
        );
      }
    } else {
      dispatch(
        setCurrentSession({
          data: {
            date: new Date().toISOString(),
            requests: {},
          },
        })
      );
    }
  }, [currentSessionID, dispatch]);

  useEffect(() => {
    dispatch(loadSessionStateFromLocalStorage());

    // Add window resize handler for responsive sidebar
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);

    // Initial check
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [dispatch]);

  if (!agentDialogOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 flex justify-center items-center p-0 sm:p-6 bg-black/80 backdrop-blur-sm z-[99999999]"
      onClick={() => dispatch(toggleAgentDialog())}
    >
      <div
        className="bg-[#09090b] h-full sm:h-[90vh] w-full sm:max-w-[1200px] sm:rounded-xl overflow-hidden shadow-2xl border border-[#ffffff10]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full h-full relative">
          {isNew ? null : (
            <SideBar
              sidebarOpen={sidebarOpen}
              isLoading={inputDisabled}
              handleStopGenerating={handleStopGenerating}
            />
          )}
          <ChatBox
            toggleSidebar={toggleSidebar}
            sidebarOpen={sidebarOpen}
            toggleAgent={toggleAgent}
            handleSubmit={handleSubmit}
            handleInputChange={handleInputChange}
            userInput={userInput}
            disabled={inputDisabled}
            isNew={isNew}
            showStopOption={inputDisabled}
            handleStopGenerating={handleStopGenerating}
          />
        </div>
      </div>
    </div>
  );
};

export default Agent;
