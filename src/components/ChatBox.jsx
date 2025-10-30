"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import axios from "axios";
import Link from "next/link";

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
  const chatEndRef = useRef(null);
  const isMountedRef = useRef(true);

  // Memoize timeSlots to avoid recalculation on every render
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Create a new session with retry logic
  const createSession = useCallback(async (retryCount = 0) => {
    const maxRetries = 3;
    try {
      const res = await axios.post(`${API_BASE}/api/session`);
      if (isMountedRef.current && res.data.sessionId) {
        setSessionId(res.data.sessionId);
        setSessionError(false);
      }
    } catch (err) {
      console.error("Failed to create session:", err);
      if (retryCount < maxRetries) {
        // Retry with exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          if (isMountedRef.current) {
            createSession(retryCount + 1);
          }
        }, delay);
      } else {
        if (isMountedRef.current) {
          setSessionError(true);
          setError("Unable to connect to the server. Please refresh the page or try again later.");
        }
      }
    }
  }, []);

  // Setup timezone and create session on load
  useEffect(() => {
    // Check if API_BASE is configured
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

    // create new session when chat loads
    createSession();

    return () => {
      isMountedRef.current = false;
    };
  }, [createSession]);

  // Update session data after every step with retry logic
  async function updateSession(data, retryCount = 0) {
    if (!sessionId) {
      console.warn("No session ID available for update");
      return;
    }
    const maxRetries = 2;
    try {
      await axios.put(`${API_BASE}/api/session/${sessionId}`, data);
    } catch (err) {
      console.error("Session update failed:", err);
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 500;
        setTimeout(() => {
          updateSession(data, retryCount + 1);
        }, delay);
      } else {
        // Session update failed but don't block user progress
        console.error("Session update failed after retries");
      }
    }
  }

  function addMessage(from, text) {
    setMessages((m) => [...m, { from, text }]);
  }

  async function handleUserSend(e) {
    e?.preventDefault();
    if (!input.trim()) return;

    addMessage("user", input);

    if (stage === "initial") {
      const newData = { message: input };
      setCollected((prev) => ({ ...prev, ...newData }));
      updateSession(newData);
      setStage("chooseService");
      addMessage("bot", "Please select a service from the list below 👇");
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

      // Fix race condition: use the current collected state values
      setCollected((prev) => {
        const finalData = {
          ...prev,
          bestTime: bestTimeString,
          service: selectedService,
        };

        // Submit with the complete data
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
      } else {
        addMessage("bot", "Something went wrong. Please try again later.");
        setError("Submission failed. Please try again.");
      }
    } catch (err) {
      console.error("Lead submission error:", err);
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          if (isMountedRef.current) {
            // Remove the "Submitting..." message before retry
            setMessages((prev) => prev.slice(0, -1));
            submitLead(payload, retryCount + 1);
          }
        }, delay);
      } else {
        addMessage("bot", "Failed to submit. Please check your connection and try again later.");
        setError("Unable to submit your details. Please try again or contact support.");
        setLoading(false);
      }
      return;
    }
    setLoading(false);
  }

  function isTimeSlotDisabled(slotValue) {
    if (!date) return false;
    const now = new Date();
    const selectedDate = new Date(date + "T00:00:00");

    // Compare dates properly (year, month, day)
    const isSameDay =
      selectedDate.getFullYear() === now.getFullYear() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getDate() === now.getDate();

    if (isSameDay) {
      const [hour, minute] = slotValue.split(":").map(Number);
      const slotTime = hour * 60 + minute;
      const currentTime = now.getHours() * 60 + now.getMinutes();

      // Disable if slot is in the past or within 30 minutes
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
        background: "#fefefe",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        transition: "all 0.6s ease",
        fontFamily: "'Gilroy', sans-serif",
      }}
    >
      {/* Fixed Header appears after start */}
      {hasStarted && (
        <header
          style={{
            width: "100%",
            position: "fixed",
            top: 0,
            left: 0,
            background: "#ffffffeb",
            backdropFilter: "blur(10px)",
            padding: "12px 24px",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          <h2 style={{ fontSize: 22, fontWeight: 600, color: "#0e8695", fontFamily: "'Gilroy', sans-serif" }}>
            NQD.ai
          </h2>

        </header>
      )}

      {/* ? Hover Button fixed bottom-right */}
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
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: "12px 20px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              fontSize: 14,
              minWidth: 180,
              zIndex: 101,
              fontFamily: "'Gilroy', sans-serif",
            }}
          >
            <Link
              href="/privacy-policy"
              style={{ color: "#000", textDecoration: "none" }}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              style={{ color: "#000", textDecoration: "none" }}
            >
              Terms of Service
            </Link>
          </div>
        )}
      </div>

      {/* Intro view before chat */}
      {!hasStarted ? (
        <div
          style={{
            textAlign: "center",
            maxWidth: 500,
            width: "90%",
            marginTop: "20vh",
            transition: "all 0.5s ease",
            background: "#fff",
            padding: "60px 40px",
            borderRadius: 24,
            boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
          }}
        >
          <h1 style={{ fontSize: 42, fontWeight: 600, color: "#11333d", marginBottom: 40, fontFamily: "'Gilroy', sans-serif" }}>
            NQD<span style={{ color: "#0e8695" }}>.</span>ai
          </h1>

          {error && sessionError && (
            <div
              role="alert"
              style={{
                padding: "12px 16px",
                background: "#fee",
                border: "1px solid #fcc",
                borderRadius: 8,
                color: "#c33",
                fontSize: 14,
                marginBottom: 20,
                textAlign: "left",
                fontFamily: "'Gilroy', sans-serif",
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
              border: "1px solid #d9e3e6",
              borderRadius: 18,
              padding: "8px 14px",
              background: "#f9fafb",
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
              }}
            />
            <button
              type="submit"
              disabled={sessionError || loading || !input.trim()}
              aria-label="Send message"
              style={{
                background: sessionError || loading || !input.trim() ? "#ccc" : "#0e8695",
                border: "none",
                color: "#fff",
                padding: "8px 14px",
                borderRadius: 12,
                cursor: sessionError || loading || !input.trim() ? "not-allowed" : "pointer",
                fontWeight: 500,
                fontFamily: "'Gilroy', sans-serif",
              }}
            >
              ➤
            </button>
          </form>
        </div>
      ) : (
        /* Active Chat View */
        <div
          style={{
            width: "70%",
            maxWidth: 900,
            marginTop: 100,
            background: "transparent",
            transition: "all 0.5s ease",
          }}
        >
          {/* Chat Messages */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              background: "#f9fafb",
              borderRadius: 16,
              padding: 20,
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.from === "bot" ? "flex-start" : "flex-end",
                  background: m.from === "bot" ? "#eef3f5" : "#d1f7f0",
                  padding: "10px 14px",
                  borderRadius:
                    m.from === "bot"
                      ? "16px 16px 16px 4px"
                      : "16px 16px 4px 16px",
                  maxWidth: "80%",
                  fontSize: 14.5,
                  color: "#111",
                  fontFamily: "'Gilroy', sans-serif",
                }}
              >
                {m.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Error Display */}
          {error && !sessionError && (
            <div
              role="alert"
              style={{
                padding: "12px 16px",
                background: "#fee",
                border: "1px solid #fcc",
                borderRadius: 8,
                color: "#c33",
                fontSize: 14,
                marginTop: 16,
                fontFamily: "'Gilroy', sans-serif",
              }}
            >
              {error}
            </div>
          )}

          {/* Input / Form Section */}
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
                            border: "1px solid #ccc",
                            background: loading ? "#eee" : "#fafafa",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontFamily: "'Gilroy', sans-serif",
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
                                border: "1px solid #ccc",
                                fontSize: 14,
                                fontFamily: "'Gilroy', sans-serif",
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
                                        ? "2px solid #007bff"
                                        : "1px solid #ccc",
                                    background:
                                      time === slot.value ? "#007bff" : "#fff",
                                    color: isTimeSlotDisabled(slot.value) || loading
                                      ? "#aaa"
                                      : time === slot.value
                                        ? "#fff"
                                        : "#333",
                                    cursor: isTimeSlotDisabled(slot.value) || loading
                                      ? "not-allowed"
                                      : "pointer",
                                    fontFamily: "'Gilroy', sans-serif",
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
                                border: "1px solid #ccc",
                                fontSize: 14,
                                fontFamily: "'Gilroy', sans-serif",
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
                                background: loading || !date || !time ? "#ccc" : "#0e8695",
                                border: "none",
                                color: "#fff",
                                padding: "8px 14px",
                                borderRadius: 12,
                                cursor: loading || !date || !time ? "not-allowed" : "pointer",
                                fontWeight: 500,
                                fontFamily: "'Gilroy', sans-serif",
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
                                border: "1px solid #ccc",
                                fontSize: 14,
                                fontFamily: "'Gilroy', sans-serif",
                              }}
                            />
                            <button
                              type="submit"
                              disabled={loading || !input.trim()}
                              aria-label="Submit"
                              style={{
                                background: loading || !input.trim() ? "#ccc" : "#0e8695",
                                border: "none",
                                color: "#fff",
                                padding: "8px 14px",
                                borderRadius: 12,
                                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                                fontWeight: 500,
                                fontFamily: "'Gilroy', sans-serif",
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
            <div style={{ marginTop: 8, fontSize: 13, color: "#555", padding: 16, fontFamily: "'Gilroy', sans-serif" }}>
              Submitting...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
