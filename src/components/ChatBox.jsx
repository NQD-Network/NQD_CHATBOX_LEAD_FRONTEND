"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL; 

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
  const chatEndRef = useRef(null);

  const timeSlots = generateTimeSlots();

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Setup timezone and create session on load
  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    try {
      const zones = Intl.supportedValuesOf("timeZone");
      setTimezones(zones);
    } catch {
      setTimezones(["UTC", "Asia/Kolkata", "America/New_York", "Europe/London"]);
    }

    // create new session when chat loads
    createSession();
  }, []);

  // Create a new session on load
  async function createSession() {
    try {
      const res = await axios.post(`${API_BASE}/api/session`);
      setSessionId(res.data.sessionId);
    } catch (err) {
      console.error("Failed to create session:", err);
    }
  }

  // Update session data after every step
  async function updateSession(data) {
    if (!sessionId) return;
    try {
      await axios.put(`${API_BASE}/api/session/${sessionId}`, data);
    } catch (err) {
      console.error("Session update failed:", err);
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
      const newData = { name: answer };
      setCollected((prev) => ({ ...prev, ...newData }));
      updateSession(newData);
      addMessage("user", answer);
      setStage("askEmail");
      addMessage("bot", "Please provide your email.");
      setInput("");
      return;
    }
    if (stage === "askEmail") {
      const newData = { email: answer };
      setCollected((prev) => ({ ...prev, ...newData }));
      updateSession(newData);
      addMessage("user", answer);
      setStage("askPhone");
      addMessage("bot", "Please provide your contact number.");
      setInput("");
      return;
    }
    if (stage === "askPhone") {
      const newData = { phone: answer };
      setCollected((prev) => ({ ...prev, ...newData }));
      updateSession(newData);
      addMessage("user", answer);
      setStage("askBestTime");
      addMessage("bot", "Please select a date, time slot, and timezone 📅");
      setInput("");
      return;
    }
    if (stage === "askBestTime") {
      if (!date || !time) {
        alert("Please select date & time.");
        return;
      }

      const bestTimeString = `${date} ${time} (${timezone})`;
      const newData = { bestTime: bestTimeString };
      setCollected((prev) => ({ ...prev, ...newData }));
      updateSession(newData);
      addMessage("user", bestTimeString);
      submitLead({
        ...collected,
        bestTime: bestTimeString,
        service: selectedService,
      });
    }
  }

  async function submitLead(payload) {
    setLoading(true);
    addMessage("bot", "Submitting your details...");
    try {
      const res = await axios.post(`${API_BASE}/api/leads`, {
        ...payload,
        sessionId,
      });
      if (res.data && res.data.success) {
        addMessage("bot", "✅ Thank you! We will contact you soon.");
        setStage("done");
      } else {
        addMessage("bot", "Something went wrong. Please try again later.");
      }
    } catch (err) {
      console.error(err);
      addMessage("bot", "Failed to submit. Please try again later.");
    }
    setLoading(false);
  }

  function isTimeSlotDisabled(slotValue) {
    if (!date) return false;
    const today = new Date();
    const selectedDate = new Date(date);
    if (selectedDate.toDateString() === today.toDateString()) {
      const [hour, minute] = slotValue.split(":").map(Number);
      return (
        hour < today.getHours() ||
        (hour === today.getHours() && minute <= today.getMinutes())
      );
    }
    return false;
  }

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        background: "#fafdfc",
        fontFamily: "Gilroy-Light.eot, sans-serif",
        padding: 16,
        boxSizing: "border-box",
      }}
    >
      {/* Before chat starts */}
      {stage === "initial" && messages.length === 1 ? (
        <div
          style={{
            textAlign: "center",
            maxWidth: 500,
            width: "90%",
            background: "#fff",
            padding: "60px 40px",
            borderRadius: 24,
            boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
          }}
        >
          <h1
            style={{
              fontSize: 42,
              fontWeight: 600,
              color: "#11333d",
              marginBottom: 40,
            }}
          >
            NQD<span style={{ color: "#0e8695" }}>.</span>ai
          </h1>

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
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything or describe your project..."
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: 16,
                background: "transparent",
              }}
            />
            <button
              type="submit"
              style={{
                background: "#0e8695",
                border: "none",
                color: "#fff",
                padding: "8px 14px",
                borderRadius: 12,
                cursor: "pointer",
                fontWeight: 500,
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
            width: "90%",
            maxWidth: 800,
            display: "flex",
            flexDirection: "column",
            background: "#fff",
            borderRadius: 20,
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            overflow: "visible",
            paddingBottom: 16,
            paddingTop: 250,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              background: "#0e8695",
              color: "#fff",
              fontSize: 18,
              fontWeight: 600,
              textAlign: "center",
              paddingTop: 10,
            }}
          >
            NQD.ai
          </div>

          {/* Chat Messages */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              background: "#f9fafb",
              margin: 16,
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
                    m.from === "bot" ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
                  maxWidth: "80%",
                  fontSize: 14.5,
                  lineHeight: 1.4,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                  fontFamily: "Gilroy-Light.eot, sans-serif",
                  // fontWeight: "bold",
                  color: "#111",
                }}
              >
                {m.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input / Service / Time Selection Section */}
          {(stage === "chooseService" ||
            stage === "askName" ||
            stage === "askEmail" ||
            stage === "askPhone" ||
            stage === "askBestTime") && (
              <div style={{ padding: 16 }}>
                {/* Service Buttons */}
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
                        style={{
                          padding: "8px 10px",
                          borderRadius: 8,
                          border: "1px solid #ccc",
                          background: "#fafafa",
                          cursor: "pointer",
                          transition: "0.2s",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.background = "#e6f7ff")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.background = "#fafafa")
                        }
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {/* Form Input */}
                {(stage === "askName" ||
                  stage === "askEmail" ||
                  stage === "askPhone" ||
                  stage === "askBestTime" ||
                  stage === "initial") && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (stage === "askBestTime") {
                          handleAnswer();
                        } else if (input.trim()) {
                          if (
                            stage === "askName" ||
                            stage === "askEmail" ||
                            stage === "askPhone"
                          ) {
                            handleAnswer(input);
                          } else {
                            handleUserSend();
                          }
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
                            required
                            style={{
                              padding: 8,
                              borderRadius: 6,
                              border: "1px solid #ccc",
                              fontSize: 14,
                            }}
                          />

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: 8,
                            }}
                          >
                            {timeSlots.map((slot) => (
                              <button
                                key={slot.value}
                                type="button"
                                onClick={() => setTime(slot.value)}
                                disabled={isTimeSlotDisabled(slot.value)}
                                style={{
                                  padding: "8px 10px",
                                  borderRadius: 8,
                                  border:
                                    time === slot.value
                                      ? "2px solid #007bff"
                                      : "1px solid #ccc",
                                  background: time === slot.value ? "#007bff" : "#fff",
                                  color: isTimeSlotDisabled(slot.value)
                                    ? "#aaa"
                                    : time === slot.value
                                      ? "#fff"
                                      : "#333",
                                  cursor: isTimeSlotDisabled(slot.value)
                                    ? "not-allowed"
                                    : "pointer",
                                  fontSize: 13,
                                  fontWeight: 500,
                                  transition: "0.2s",
                                }}
                              >
                                {slot.label}
                              </button>
                            ))}
                          </div>

                          <select
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            style={{
                              padding: 8,
                              borderRadius: 6,
                              border: "1px solid #ccc",
                              fontSize: 14,
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
                            style={{
                              background: "#0e8695",
                              border: "none",
                              color: "#fff",
                              padding: "8px 14px",
                              borderRadius: 12,
                              cursor: "pointer",
                              fontWeight: 500,
                            }}
                          >
                            ➤
                          </button>
                        </>
                      ) : (
                        <div style={{ display: "flex", gap: 8 }}>
                          <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={
                              stage === "askName"
                                ? "Your full name"
                                : stage === "askEmail"
                                  ? "Your email"
                                  : stage === "askPhone"
                                    ? "Contact number"
                                    : "Type here..."
                            }
                            style={{
                              flex: 1,
                              padding: 8,
                              borderRadius: 6,
                              border: "1px solid #ccc",
                              fontSize: 14,
                            }}
                          />
                          <button
                            type="submit"
                            style={{
                              background: "#0e8695",
                              border: "none",
                              color: "#fff",
                              padding: "8px 14px",
                              borderRadius: 12,
                              cursor: "pointer",
                              fontWeight: 500,
                            }}
                          >
                            ➤
                          </button>
                        </div>
                      )}
                    </form>
                  )}
              </div>
            )}

          {loading && (
            <div style={{ marginTop: 8, fontSize: 13, color: "#555", padding: 16 }}>
              Submitting...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
