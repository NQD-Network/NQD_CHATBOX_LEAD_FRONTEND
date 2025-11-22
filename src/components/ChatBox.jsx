"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import { useTheme } from '../contexts/ThemeContext';
import { useRouter } from "next/router";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

// Validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

const validateName = (name) => {
  return name.trim().length >= 2 && name.trim().length <= 100;
};

const SERVICES = [
  "Website Development",
  "App Development",
  "AWS Developer",
  "Automation",
  "ERP",
  "CRM Specialist",
  "CHATBOT Development",
  "Digital Marketing",
  "SEO",
  "API Developer",
  "Odoo Specialist",
  "Other",
];

function generateTimeSlots() {
  const slots = [];
  for (let hour = 9; hour <= 18; hour++) {
    for (let min of [0, 30]) {
      if (hour === 18 && min > 0) break;
      slots.push({
        value: `${hour.toString().padStart(2, "0")}:${min
          .toString()
          .padStart(2, "0")}`,
        label: new Date(0, 0, 0, hour, min).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        }),
      });
    }
  }
  return slots;
}

export default function ChatBox() {
  const { colors } = useTheme();
  const router = useRouter();
  const [messages, setMessages] = useState([
    { from: "bot", text: "👋 How may I help you?" },
  ]);
  const [input, setInput] = useState("");
  const [stage, setStage] = useState("initial");
  const [selectedService, setSelectedService] = useState(null);
  const [collected, setCollected] = useState({
    message: "",
    name: "",
    email: "",
    phone: "",
    bestTime: "",
    service: "",
  });
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [timezone, setTimezone] = useState("");
  const [timezones, setTimezones] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [error, setError] = useState(null);
  const [sessionError, setSessionError] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [sessionsLinked, setSessionsLinked] = useState(false);
  const [linkSessionError, setLinkSessionError] = useState(false);
  const [loadSessionError, setLoadSessionError] = useState(false);
  const chatEndRef = useRef(null);
  const isMountedRef = useRef(true);
  const sessionLoadedRef = useRef(false);

  // Memoize timeSlots to avoid recalculation on every render
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  // ✅ Get current userId if logged in and link all localStorage sessions
  useEffect(() => {
    const getUserIdAndLinkSessions = async () => {
      const accessToken = localStorage.getItem('access_token');

      if (accessToken && !sessionsLinked) {
        try {
          const userInfoRes = await fetch('/api/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });

          if (userInfoRes.ok) {
            const userData = await userInfoRes.json();
            const userId = userData.id || userData.sub;
            setCurrentUserId(userId);

            const userSessions = JSON.parse(localStorage.getItem('user_sessions') || '[]');

            if (userSessions.length > 0) {
              const linkPromises = userSessions.map(async (sessionId) => {
                try {
                  await axios.post(`${API_BASE}/api/session/link-user`, {
                    sessionId,
                    userId
                  });
                } catch (err) {
                  if (err.response?.status === 404) {
                    return null;
                  }
                  return null;
                }
              });

              await Promise.all(linkPromises);
              localStorage.removeItem('user_sessions');
              setSessionsLinked(true);
              window.dispatchEvent(new Event('session-updated'));
            }
          } else {
            if (userInfoRes.status === 401) {
              localStorage.removeItem('access_token');
              setError("Session expired. Please log in again.");
            }
          }
        } catch (err) {
          setLinkSessionError(true);
        }
      }
    };

    getUserIdAndLinkSessions();
  }, [sessionsLinked]);

  // ✅ CRITICAL FIX: Wait for router to be ready before loading session
  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    if (sessionLoadedRef.current) return;

    const urlSessionId = router.query.sessionId;

    if (urlSessionId) {
      // ✅ Load existing session from URL
      loadExistingSession(urlSessionId);
      sessionLoadedRef.current = true;
    } else {
      // ✅ Create new session only if NO sessionId in URL
      const initSession = async () => {
        await new Promise(resolve => setTimeout(resolve, 500));

        const newSessionId = await createNewSession();
        if (newSessionId) {
          setSessionId(newSessionId);

          if (!currentUserId) {
            const existingSessions = JSON.parse(localStorage.getItem('user_sessions') || '[]');
            if (!existingSessions.includes(newSessionId)) {
              existingSessions.push(newSessionId);
              localStorage.setItem('user_sessions', JSON.stringify(existingSessions));
            }
          }
        }
      };
      initSession();
      sessionLoadedRef.current = true;
    }
  }, [router.isReady, router.query.sessionId, currentUserId]);

  async function loadExistingSession(sessionId) {
    try {
      setLoading(true);
      setLoadSessionError(false);

      const res = await axios.get(`${API_BASE}/api/session/${sessionId}`);

      if (res.data.success && res.data.session) {
        const session = res.data.session;

        if (session.messages && session.messages.length > 0) {
          setMessages(session.messages);
        }

        setCollected({
          message: session.message || "",
          name: session.name || "",
          email: session.email || "",
          phone: session.phone || "",
          bestTime: session.bestTime || "",
          service: session.service || "",
        });

        setSessionId(sessionId);

        if (session.bestTime) {
          setStage("done");
        } else if (session.phone) {
          setStage("askBestTime");
        } else if (session.email) {
          setStage("askPhone");
        } else if (session.name) {
          setStage("askEmail");
        } else if (session.service) {
          setSelectedService(session.service);
          setStage("askName");
        } else if (session.message) {
          setStage("chooseService");
        }
      } else {
        setLoadSessionError(true);
        setError("Unable to load this conversation. Starting a new one...");

        setTimeout(async () => {
          const newSessionId = await createNewSession();
          if (newSessionId) {
            setSessionId(newSessionId);
            router.replace(`/?sessionId=${newSessionId}`, undefined, { shallow: true });
          }
        }, 2000);
      }
    } catch (err) {
      setLoadSessionError(true);

      if (err.response?.status === 404) {
        setError("This conversation no longer exists. Starting a new one...");
        addMessage("bot", "Starting a fresh conversation 👋");
      } else if (err.response?.status === 403) {
        setError("You don't have access to this conversation.");
        addMessage("bot", "Let's start a new conversation 👋");
      } else {
        setError("Unable to load conversation. Please check your internet connection.");
      }

      setTimeout(async () => {
        setError(null);
        const newSessionId = await createNewSession();
        if (newSessionId) {
          setSessionId(newSessionId);
          if (router.query.sessionId) {
            router.replace(`/?sessionId=${newSessionId}`, undefined, { shallow: true });
          }
        }
      }, 3000);
    } finally {
      setLoading(false);
    }
  }

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createNewSession = async (retryCount = 0) => {
    const maxRetries = 3;
    try {
      const payload = {};

      if (currentUserId) {
        payload.userId = currentUserId;
      }

      const res = await axios.post(`${API_BASE}/api/session`, payload);
      if (res.data.sessionId) {
        setSessionError(false);
        return res.data.sessionId;
      }
    } catch (err) {
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return createNewSession(retryCount + 1);
      } else {
        setSessionError(true);
        return null;
      }
    }
  };

  // Setup timezone on load
  useEffect(() => {
    if (!API_BASE) {
      setSessionError(true);
      setError("Configuration error: API endpoint not configured. Please contact support.");
      return;
    }

    isMountedRef.current = true;

    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    try {
      const zones = Intl.supportedValuesOf("timeZone");
      setTimezones(zones);
    } catch {
      setTimezones(["UTC", "Asia/Kolkata", "America/New_York", "Europe/London"]);
    }

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  async function updateSession(data, retryCount = 0) {
    if (!sessionId) {
      return;
    }

    const maxRetries = 2;

    try {
      await axios.put(`${API_BASE}/api/session/${sessionId}`, data);
      window.dispatchEvent(new Event('session-updated'));
    } catch (err) {
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 500;
        setTimeout(() => {
          updateSession(data, retryCount + 1);
        }, delay);
      } else {
        if (err.response?.status === 404) {
          setError("Your session expired. Creating a new one...");

          setTimeout(async () => {
            const newSessionId = await createNewSession();
            if (newSessionId) {
              setSessionId(newSessionId);
              setError(null);
              router.replace(`/?sessionId=${newSessionId}`, undefined, { shallow: true });
            }
          }, 2000);
        } else {
          setError("Changes may not be saved. Please check your connection.");
          setTimeout(() => setError(null), 5000);
        }
      }
    }
  }

  function addMessage(from, text) {
    const newMessage = { from, text, timestamp: new Date() };
    setMessages((m) => {
      const updatedMessages = [...m, newMessage];

      if (sessionId) {
        updateSession({ messages: updatedMessages });
      }

      return updatedMessages;
    });
  }

  async function handleUserSend(e) {
    e?.preventDefault();
    if (!input.trim()) return;

    addMessage("user", input);

    if (stage === "initial") {
      const firstMessage = input.trim();
      const newData = {
        message: firstMessage,
        firstMessage: firstMessage
      };
      setCollected((prev) => ({ ...prev, ...newData }));
      await updateSession(newData);
      setStage("chooseService");
      addMessage("bot", "Please select a service from the list below 👇");

      window.dispatchEvent(new Event('session-updated'));
    }

    setInput("");
  }

  function chooseService(service) {
    setSelectedService(service);
    const newData = { service };
    setCollected((prev) => ({ ...prev, ...newData }));
    updateSession(newData);
    addMessage("user", service);
    setStage("askName");
    addMessage("bot", "Great! Please tell me your full name.");
  }

  function handleAnswer(answer) {
    if (stage === "askName") {
      if (!validateName(answer)) {
        setError("Please enter a valid name (2-100 characters).");
        return;
      }
      const newData = { name: answer.trim() };
      setCollected((prev) => ({ ...prev, ...newData }));
      updateSession(newData);
      addMessage("user", answer.trim());
      setStage("askEmail");
      addMessage("bot", "Please provide your email.");
      setInput("");
      setError(null);
      return;
    }
    if (stage === "askEmail") {
      if (!validateEmail(answer)) {
        setError("Please enter a valid email address.");
        return;
      }
      const newData = { email: answer.trim() };
      setCollected((prev) => ({ ...prev, ...newData }));
      updateSession(newData);
      addMessage("user", answer.trim());
      setStage("askPhone");
      addMessage("bot", "Please provide your contact number.");
      setInput("");
      setError(null);
      return;
    }
    if (stage === "askPhone") {
      if (!validatePhone(answer)) {
        setError("Please enter a valid phone number (minimum 10 digits).");
        return;
      }
      const newData = { phone: answer.trim() };
      setCollected((prev) => ({ ...prev, ...newData }));
      updateSession(newData);
      addMessage("user", answer.trim());
      setStage("askBestTime");
      addMessage("bot", "Please select a date, time slot, and timezone 📅");
      setError(null);
      return;
    }
    if (stage === "askBestTime") {
      if (!date || !time) {
        setError("Please select both date and time.");
        return;
      }

      const bestTimeString = `${date} ${time} (${timezone})`;

      setCollected((prev) => {
        const finalData = {
          ...prev,
          bestTime: bestTimeString,
          service: selectedService,
        };

        addMessage("user", bestTimeString);
        submitLead(finalData);

        return { ...prev, bestTime: bestTimeString };
      });

      updateSession({ bestTime: bestTimeString });
      setError(null);
    }
  }

  async function submitLead(payload, retryCount = 0) {
    setLoading(true);
    addMessage("bot", "Submitting your details...");
    const maxRetries = 2;

    try {
      const res = await axios.post(`${API_BASE}/api/leads`, {
        ...payload,
        sessionId,
      });

      if (res.data && res.data.success) {
        addMessage("bot", "✅ Thank you! We will contact you soon.");
        setStage("done");
        setError(null);

        setTimeout(() => {
          addMessage("bot", "Feel free to start a new conversation anytime!");
        }, 2000);
      } else {
        throw new Error("Submission failed");
      }
    } catch (err) {
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000;

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            text: `Retrying submission (${retryCount + 1}/${maxRetries})...`
          };
          return updated;
        });

        setTimeout(() => {
          if (isMountedRef.current) {
            submitLead(payload, retryCount + 1);
          }
        }, delay);
      } else {
        setMessages((prev) => prev.slice(0, -1));

        if (!navigator.onLine) {
          addMessage("bot", "❌ No internet connection. Please check your network and try again.");
          setError("You appear to be offline. Please check your internet connection.");
        } else if (err.response?.status === 400) {
          addMessage("bot", "❌ Invalid information provided. Please check your details and try again.");
          setError("Please verify all information is correct.");
          setStage("askBestTime");
        } else if (err.response?.status >= 500) {
          addMessage("bot", "❌ Our server is experiencing issues. Please try again in a few minutes.");
          setError("Server error. Your data has been saved and we'll contact you soon.");
        } else {
          addMessage("bot", "❌ Unable to submit. Please email us directly at support@nqd.ai or try again later.");
          setError("Submission failed. Please contact us directly or try again.");
        }

        setTimeout(() => {
          addMessage("bot", "Would you like to try submitting again?");
        }, 1000);
      }
    } finally {
      setLoading(false);
    }
  }

  function isTimeSlotDisabled(slotValue) {
    if (!date) return false;
    const now = new Date();
    const selectedDate = new Date(date + "T00:00:00");

    const isSameDay =
      selectedDate.getFullYear() === now.getFullYear() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getDate() === now.getDate();

    if (isSameDay) {
      const [hour, minute] = slotValue.split(":").map(Number);
      const slotTime = hour * 60 + minute;
      const currentTime = now.getHours() * 60 + now.getMinutes();
      return slotTime <= currentTime + 30;
    }
    return false;
  }

  const hasStarted = stage !== "initial" || messages.length > 1;

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: colors.background,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        transition: "all 0.6s ease",
        fontFamily: "'Gilroy', sans-serif",
      }}
    >
      {hasStarted && (
        <header
          style={{
            width: "100%",
            position: "fixed",
            top: 0,
            left: 0,
            background: colors.headerBg,
            backdropFilter: "blur(10px)",
            padding: "12px 24px",
            borderBottom: `1px solid ${colors.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 10,
            transition: "background 0.3s ease, border-color 0.3s ease",
          }}
        >
          <h2 style={{ marginLeft: 50, fontSize: 22, fontWeight: 600, color: colors.brand, fontFamily: "'Gilroy', sans-serif" }}>
            NQD.ai
          </h2>
        </header>
      )}

      <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 100 }}>
        <div
          onClick={() => setShowMenu(!showMenu)}
          style={{
            cursor: "pointer",
            fontSize: 28,
            fontWeight: 600,
            background: "#0e8695",
            color: "#fff",
            width: 50,
            height: 50,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            fontFamily: "'Gilroy', sans-serif",
          }}
        >
          ?
        </div>
        {showMenu && (
          <div
            style={{
              position: "absolute",
              right: 0,
              bottom: 60,
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
              borderRadius: 12,
              padding: "12px 20px",
              boxShadow: `0 4px 16px ${colors.cardShadow}`,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              fontSize: 14,
              minWidth: 180,
              zIndex: 101,
              fontFamily: "'Gilroy', sans-serif",
              transition: "background 0.3s ease, border-color 0.3s ease",
            }}
          >
            <Link
              href="/privacy-policy"
              style={{ color: colors.text, textDecoration: "none", transition: "color 0.3s ease" }}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              style={{ color: colors.text, textDecoration: "none", transition: "color 0.3s ease" }}
            >
              Terms of Service
            </Link>
          </div>
        )}
      </div>

      {!hasStarted ? (
        <div
          style={{
            textAlign: "center",
            maxWidth: 500,
            width: "90%",
            marginTop: "20vh",
            transition: "all 0.5s ease",
            background: colors.cardBg,
            padding: "60px 40px",
            borderRadius: 24,
            boxShadow: `0 8px 30px ${colors.cardShadow}`,
          }}
        >
          <h1 style={{ fontSize: 42, fontWeight: 600, color: colors.title, marginBottom: 40, fontFamily: "'Gilroy', sans-serif", transition: "color 0.3s ease" }}>
            NQD<span style={{ color: colors.brand }}>.</span>ai
          </h1>

          {error && sessionError && (
            <div
              role="alert"
              style={{
                padding: "12px 16px",
                background: colors.errorBg,
                border: `1px solid ${colors.errorBorder}`,
                borderRadius: 8,
                color: colors.error,
                fontSize: 14,
                marginBottom: 20,
                textAlign: "left",
                fontFamily: "'Gilroy', sans-serif",
                transition: "background 0.3s ease, border-color 0.3s ease, color 0.3s ease",
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleUserSend}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: `1px solid ${colors.inputBorder}`,
              borderRadius: 18,
              padding: "8px 14px",
              background: colors.inputBg,
              transition: "background 0.3s ease, border-color 0.3s ease",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything or describe your project..."
              disabled={sessionError || loading}
              aria-label="Your message or project description"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: 16,
                background: "transparent",
                fontFamily: "'Gilroy', sans-serif",
                color: colors.text,
                transition: "color 0.3s ease",
              }}
            />
            <button
              type="submit"
              disabled={sessionError || loading || !input.trim()}
              aria-label="Send message"
              style={{
                background: sessionError || loading || !input.trim() ? colors.buttonDisabled : colors.brand,
                border: "none",
                color: "#fff",
                padding: "8px 14px",
                borderRadius: 12,
                cursor: sessionError || loading || !input.trim() ? "not-allowed" : "pointer",
                fontWeight: 500,
                fontFamily: "'Gilroy', sans-serif",
                transition: "background 0.3s ease",
              }}
            >
              ➤
            </button>
          </form>
        </div>
      ) : (
        <div
          style={{
            width: window.innerWidth < 768 ? "95%" : "70%",
            maxWidth: 900,
            marginTop: 100,
            background: "transparent",
            transition: "all 0.5s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              background: colors.backgroundSecondary,
              borderRadius: 16,
              padding: 20,
              boxShadow: `0 4px 12px ${colors.cardShadow}`,
              transition: "background 0.3s ease",
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.from === "bot" ? "flex-start" : "flex-end",
                  background: m.from === "bot" ? colors.chatBotBg : colors.chatUserBg,
                  padding: "10px 14px",
                  borderRadius:
                    m.from === "bot"
                      ? "16px 16px 16px 4px"
                      : "16px 16px 4px 16px",
                  maxWidth: "80%",
                  fontSize: 14.5,
                  color: colors.text,
                  fontFamily: "'Gilroy', sans-serif",
                  transition: "background 0.3s ease, color 0.3s ease",
                }}
              >
                {m.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {error && !sessionError && (
            <div
              role="alert"
              style={{
                padding: "12px 16px",
                background: colors.errorBg,
                border: `1px solid ${colors.errorBorder}`,
                borderRadius: 8,
                color: colors.error,
                fontSize: 14,
                marginTop: 16,
                fontFamily: "'Gilroy', sans-serif",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "all 0.3s ease",
              }}
            >
              <span>{error}</span>
              {!loadSessionError && !sessionError && (
                <button
                  onClick={() => setError(null)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: colors.error,
                    cursor: "pointer",
                    fontSize: 18,
                    fontWeight: "bold",
                    padding: "0 8px",
                  }}
                  aria-label="Dismiss error"
                >
                  ×
                </button>
              )}
            </div>
          )}

          <div style={{ padding: 16 }}>
            {(stage === "chooseService" ||
              stage === "askName" ||
              stage === "askEmail" ||
              stage === "askPhone" ||
              stage === "askBestTime") && (
                <>
                  {stage === "chooseService" && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      {SERVICES.map((s) => (
                        <button
                          key={s}
                          onClick={() => chooseService(s)}
                          disabled={loading}
                          aria-label={`Select ${s} service`}
                          style={{
                            padding: "8px 10px",
                            borderRadius: 8,
                            border: `1px solid ${colors.border}`,
                            background: loading ? colors.buttonDisabled : colors.backgroundTertiary,
                            cursor: loading ? "not-allowed" : "pointer",
                            fontFamily: "'Gilroy', sans-serif",
                            color: colors.text,
                            transition: "background 0.3s ease, border-color 0.3s ease, color 0.3s ease",
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  {(stage === "askName" ||
                    stage === "askEmail" ||
                    stage === "askPhone" ||
                    stage === "askBestTime") && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (stage === "askBestTime") {
                            handleAnswer();
                          } else if (input.trim()) {
                            handleAnswer(input);
                          }
                          setInput("");
                        }}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                          marginTop: 10,
                        }}
                      >
                        {stage === "askBestTime" ? (
                          <>
                            <input
                              type="date"
                              value={date}
                              min={new Date().toISOString().split("T")[0]}
                              onChange={(e) => setDate(e.target.value)}
                              disabled={loading}
                              required
                              aria-label="Select date"
                              style={{
                                padding: 8,
                                borderRadius: 6,
                                border: `1px solid ${colors.border}`,
                                fontSize: 14,
                                fontFamily: "'Gilroy', sans-serif",
                                background: colors.backgroundTertiary,
                                color: colors.text,
                                transition: "background 0.3s ease, border-color 0.3s ease, color 0.3s ease",
                              }}
                            />

                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 8,
                              }}
                              role="group"
                              aria-label="Select time slot"
                            >
                              {timeSlots.map((slot) => (
                                <button
                                  key={slot.value}
                                  type="button"
                                  onClick={() => setTime(slot.value)}
                                  disabled={isTimeSlotDisabled(slot.value) || loading}
                                  aria-label={`Time slot ${slot.label}`}
                                  aria-pressed={time === slot.value}
                                  style={{
                                    padding: "8px 10px",
                                    borderRadius: 8,
                                    border:
                                      time === slot.value
                                        ? `2px solid ${colors.brand}`
                                        : `1px solid ${colors.border}`,
                                    background:
                                      time === slot.value ? colors.brand : colors.backgroundTertiary,
                                    color: isTimeSlotDisabled(slot.value) || loading
                                      ? colors.textDisabled
                                      : time === slot.value
                                        ? "#fff"
                                        : colors.text,
                                    cursor: isTimeSlotDisabled(slot.value) || loading
                                      ? "not-allowed"
                                      : "pointer",
                                    fontFamily: "'Gilroy', sans-serif",
                                    transition: "background 0.3s ease, border-color 0.3s ease, color 0.3s ease",
                                  }}
                                >
                                  {slot.label}
                                </button>
                              ))}
                            </div>

                            <select
                              value={timezone}
                              onChange={(e) => setTimezone(e.target.value)}
                              disabled={loading}
                              aria-label="Select timezone"
                              style={{
                                padding: 8,
                                borderRadius: 6,
                                border: `1px solid ${colors.border}`,
                                fontSize: 14,
                                fontFamily: "'Gilroy', sans-serif",
                                background: colors.backgroundTertiary,
                                color: colors.text,
                                transition: "background 0.3s ease, border-color 0.3s ease, color 0.3s ease",
                              }}
                            >
                              {timezones.map((z) => (
                                <option key={z} value={z}>
                                  {z}
                                </option>
                              ))}
                            </select>

                            <button
                              type="submit"
                              disabled={loading || !date || !time}
                              aria-label="Submit date and time"
                              style={{
                                background: loading || !date || !time ? colors.buttonDisabled : colors.brand,
                                border: "none",
                                color: "#fff",
                                padding: "8px 14px",
                                borderRadius: 12,
                                cursor: loading || !date || !time ? "not-allowed" : "pointer",
                                fontWeight: 500,
                                fontFamily: "'Gilroy', sans-serif",
                                transition: "background 0.3s ease",
                              }}
                            >
                              ➤
                            </button>
                          </>
                        ) : (
                          <div style={{ display: "flex", gap: 8 }}>
                            <input
                              type={
                                stage === "askEmail"
                                  ? "email"
                                  : stage === "askPhone"
                                    ? "tel"
                                    : "text"
                              }
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                              placeholder={
                                stage === "askName"
                                  ? "Your full name"
                                  : stage === "askEmail"
                                    ? "Your email"
                                    : "Contact number"
                              }
                              disabled={loading}
                              aria-label={
                                stage === "askName"
                                  ? "Full name"
                                  : stage === "askEmail"
                                    ? "Email address"
                                    : "Phone number"
                              }
                              autoComplete={
                                stage === "askName"
                                  ? "name"
                                  : stage === "askEmail"
                                    ? "email"
                                    : "tel"
                              }
                              style={{
                                flex: 1,
                                padding: 8,
                                borderRadius: 6,
                                border: `1px solid ${colors.border}`,
                                fontSize: 14,
                                fontFamily: "'Gilroy', sans-serif",
                                background: colors.backgroundTertiary,
                                color: colors.text,
                                transition: "background 0.3s ease, border-color 0.3s ease, color 0.3s ease",
                              }}
                            />
                            <button
                              type="submit"
                              disabled={loading || !input.trim()}
                              aria-label="Submit"
                              style={{
                                background: loading || !input.trim() ? colors.buttonDisabled : colors.brand,
                                border: "none",
                                color: "#fff",
                                padding: "8px 14px",
                                borderRadius: 12,
                                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                                fontWeight: 500,
                                fontFamily: "'Gilroy', sans-serif",
                                transition: "background 0.3s ease",
                              }}
                            >
                              ➤
                            </button>
                          </div>
                        )}
                      </form>
                    )}
                </>
              )}
          </div>

          {loading && (
            <div style={{ marginTop: 8, fontSize: 13, color: colors.textSecondary, padding: 16, fontFamily: "'Gilroy', sans-serif", transition: "color 0.3s ease" }}>
              Submitting...
            </div>
          )}
        </div>
      )}
    </div>
  );
}