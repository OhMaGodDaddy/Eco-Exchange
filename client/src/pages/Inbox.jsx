import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaFilter,
  FaBell,
  FaPaperPlane,
  FaPlus,
  FaMapMarkerAlt,
} from "react-icons/fa";

const API_BASE = "https://eco-exchange-api.onrender.com";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleString([], { month: "short", day: "numeric" });
}

function formatClock(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getInitial(name = "?") {
  return name?.trim()?.[0]?.toUpperCase?.() || "?";
}

export default function Messages({ user }) {
  const [conversations, setConversations] = useState([]);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [error, setError] = useState("");

  // UI state
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [tab, setTab] = useState("all"); // all | unread | donations
  const [search, setSearch] = useState("");

  // Messages state (center pane)
  const [messages, setMessages] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [msgError, setMsgError] = useState("");
  const [draft, setDraft] = useState("");

  // keep scroll pinned to bottom when new messages come in
  const bottomRef = useRef(null);

  // Load conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoadingConvos(true);
        const res = await axios.get(`${API_BASE}/api/messages/conversations`, {
          withCredentials: true,
        });

        const convos = res.data || [];
        setConversations(convos);

        // Auto-open first conversation
        if (convos.length > 0) setActiveConversationId(convos[0].conversationId);
      } catch (err) {
        console.error(err);
        setError("Failed to load messages. Please try logging in again.");
      } finally {
        setLoadingConvos(false);
      }
    };

    fetchConversations();
  }, []);

  const activeConversation = useMemo(() => {
    return (
      conversations.find((c) => c.conversationId === activeConversationId) ||
      null
    );
  }, [conversations, activeConversationId]);

  // Fallback for the right-hand "Item Details" pane — some conversations
  // may include a linked item object. Use a safe optional lookup.
  const activeItem = activeConversation?.item || null;

  // Filter conversations (client-side)
  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations.filter((c) => {
      const name = (c?.otherUser?.username || "Unknown").toLowerCase();
      const last = (c?.lastMessage || "").toLowerCase();

      // Optional: donation/unread filtering if your backend ever provides these fields
      if (tab === "donations" && c?.type !== "donation") return false;
      if (tab === "unread" && !c?.unread) return false;

      if (!q) return true;
      return name.includes(q) || last.includes(q);
    });
  }, [conversations, search, tab]);

  // Fetch messages for active conversation (your backend route is GET /api/messages/:friendId)
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConversationId) return;

      setMsgError("");
      setLoadingMsgs(true);

      try {
        const res = await axios.get(
          `${API_BASE}/api/messages/${activeConversationId}`,
          { withCredentials: true }
        );
        setMessages(res.data || []);
      } catch (err) {
        console.error(err);
        setMessages([]);
        setMsgError("Failed to load messages.");
      } finally {
        setLoadingMsgs(false);
      }
    };

    fetchMessages();
  }, [activeConversationId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeConversationId]);

  // Send message (your backend route is POST /api/messages with { receiverId, text })
  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || !activeConversationId) return;

    // optimistic message (matches your schema: senderId/receiverId/text)
    const optimistic = {
      _id: `tmp-${Date.now()}`,
      senderId: user?._id,
      receiverId: activeConversationId,
      text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);
    setDraft("");

    // Update the left list immediately
    setConversations((prev) =>
      prev.map((c) =>
        c.conversationId === activeConversationId
          ? { ...c, lastMessage: text, timestamp: new Date().toISOString() }
          : c
      )
    );

    try {
      await axios.post(
        `${API_BASE}/api/messages`,
        { receiverId: activeConversationId, text },
        { withCredentials: true }
      );
    } catch (err) {
      console.error(err);
      setMsgError("Failed to send message.");
    }
  };

  if (loadingConvos) {
    return (
      <div className="min-h-[70vh] grid place-items-center text-zinc-600">
        Loading your chats…
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-10 max-w-xl rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-zinc-200">
        <div className="text-lg font-bold text-zinc-900">Oops</div>
        <div className="mt-2 text-sm text-rose-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] bg-zinc-50 overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-4 py-6 h-full overflow-hidden">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr_320px] h-full overflow-hidden">          
            {/* LEFT: conversation list */}
            <aside className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 flex flex-col h-full">            <div className="border-b border-zinc-100 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-zinc-900">Messages</h3>
                <button
                  type="button"
                  className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
                  aria-label="Filter"
                >
                  <FaFilter />
                </button>
              </div>

              {/* Tabs */}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setTab("all")}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-bold transition",
                    tab === "all"
                      ? "bg-emerald-500 text-zinc-900"
                      : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setTab("unread")}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-bold transition",
                    tab === "unread"
                      ? "bg-emerald-500 text-zinc-900"
                      : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                  )}
                >
                  Unread
                </button>
                <button
                  onClick={() => setTab("donations")}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-bold transition",
                    tab === "donations"
                      ? "bg-emerald-500 text-zinc-900"
                      : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                  )}
                >
                  Donations
                </button>
              </div>

              {/* Search */}
              <div className="relative mt-4">
                <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations…"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-9 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto">                  {filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-sm text-zinc-500">
                  No conversations yet.
                  <div className="mt-3">
                    <Link
                      to="/items"
                      className="inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                    >
                      Browse items
                    </Link>
                  </div>
                </div>
              ) : (
                filteredConversations.map((chat) => {
                  const name = chat?.otherUser?.username || "Unknown";
                  const isActive = chat.conversationId === activeConversationId;

                  return (
                    <button
                      key={chat.conversationId}
                      onClick={() => setActiveConversationId(chat.conversationId)}
                      className={cn(
                        "w-full border-l-4 px-4 py-4 text-left transition",
                        isActive
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-transparent hover:bg-zinc-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-zinc-200 ring-2 ring-emerald-500/20">
                          {chat?.otherUser?.avatarUrl ? (
                            <img
                              src={chat.otherUser.avatarUrl}
                              alt={name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-lg font-bold text-zinc-700">
                              {getInitial(name)}
                            </div>
                          )}
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                        </div>

                        {/* Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate font-bold text-zinc-900">{name}</p>
                            <span className="shrink-0 text-[10px] text-zinc-400">
                              {formatTime(chat.timestamp)}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-xs text-zinc-500">
                            {chat.lastMessage || "—"}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* CENTER: active chat */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 flex flex-col h-full">            {/* Chat header */}
            <div className="flex h-16 items-center justify-between border-b border-zinc-100 px-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-zinc-200 ring-2 ring-emerald-500/20">
                  <div className="grid h-full w-full place-items-center font-bold text-zinc-700">
                    {getInitial(activeConversation?.otherUser?.username || "?")}
                  </div>
                </div>
                <div>
                  <div className="font-bold text-zinc-900">
                    {activeConversation?.otherUser?.username || "Select a chat"}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Online
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex h-9 items-center gap-2 rounded-xl bg-emerald-500/15 px-3 text-xs font-bold text-zinc-900 hover:bg-emerald-500/20"
                >
                  <span className="text-[12px]">🤝</span> Finalize Exchange
                </button>
                <button
                  type="button"
                  className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
                  aria-label="Notifications"
                >
                  <FaBell />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-zinc-50 p-5">
              {loadingMsgs ? (
                <div className="text-sm text-zinc-500">Loading messages…</div>
              ) : (
                <>
                  {msgError ? (
                    <div className="mb-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-700 ring-1 ring-amber-200">
                      {msgError}
                    </div>
                  ) : null}

                  {messages.length === 0 ? (
                    <div className="grid place-items-center py-16 text-center">
                      <div className="rounded-2xl bg-white p-6 text-sm text-zinc-600 shadow-sm ring-1 ring-zinc-200">
                        No messages yet. Say hi 👋
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {messages.map((m) => {
                        // ✅ Correct "isMine" check for your schema:
                        const senderId = (m.senderId ?? "").toString();
                        const myId = (user?._id ?? "").toString();
                        const isMine = senderId === myId;

                        return (
                          <div
                            key={m._id}
                            className={cn(
                              "flex max-w-[80%] gap-3",
                              isMine ? "self-end flex-row-reverse" : "self-start"
                            )}
                          >
                            {!isMine ? (
                              <div className="mt-1 h-8 w-8 shrink-0 rounded-full bg-zinc-200" />
                            ) : null}

                            <div
                              className={cn(
                                "flex flex-col gap-1",
                                isMine && "items-end"
                              )}
                            >
                              <div
                                className={cn(
                                  "rounded-2xl p-4 text-sm shadow-sm ring-1",
                                  isMine
                                    ? "rounded-tr-none bg-emerald-500 text-zinc-900 ring-emerald-500/20"
                                    : "rounded-tl-none bg-white text-zinc-800 ring-zinc-200"
                                )}
                              >
                                {m.text || ""}
                              </div>
                              <div
                                className={cn(
                                  "text-[10px] text-zinc-400",
                                  isMine ? "mr-1" : "ml-1"
                                )}
                              >
                                {formatClock(m.createdAt || m.timestamp)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={bottomRef} />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-zinc-100 bg-white p-4">
              <div className="flex items-end gap-2 rounded-2xl border border-emerald-500/15 bg-zinc-50 p-2">
                <button
                  type="button"
                  className="grid h-10 w-10 place-items-center rounded-xl text-zinc-500 hover:bg-zinc-200"
                  aria-label="Add"
                >
                  <FaPlus />
                </button>

                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type your message…"
                  rows={1}
                  className="max-h-32 flex-1 resize-none border-none bg-transparent py-2 text-sm outline-none focus:ring-0"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={sendMessage}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500 text-zinc-900 hover:shadow-lg hover:shadow-emerald-500/20 transition"
                  aria-label="Send"
                  title="Send"
                >
                  <FaPaperPlane />
                </button>
              </div>

              <div className="mt-2 text-[11px] text-zinc-400">
                Press <span className="font-semibold">Enter</span> to send,{" "}
                <span className="font-semibold">Shift+Enter</span> for new line.
              </div>
            </div>
          </section>

          {/* RIGHT: details pane (placeholder until your backend links item data to conversations) */}
            {/* RIGHT: details pane */}
<aside className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 flex flex-col h-full">
  {/* Scrollable content INSIDE the aside */}
  <div className="flex-1 overflow-y-auto">
    <div className="border-b border-zinc-100 p-4">
      <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
        Item Details
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-zinc-200">
        <div className="relative h-40 w-full bg-zinc-200">
          <img
            alt="Item"
            className="h-full w-full object-cover"
            src={
              activeItem?.images?.[0] ||
              activeItem?.image ||
              "https://placehold.co/900x600?text=Item+Preview"
            }
            onError={(e) => {
              e.currentTarget.src = "https://placehold.co/900x600?text=No+Image";
            }}
          />
          <div className="absolute right-2 top-2 rounded-md bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-zinc-900">
            EXCHANGE
          </div>
        </div>

        <div className="p-3">
          <div className="font-bold text-zinc-900">
            {activeItem?.title || "Item title"}
          </div>

          <div className="mt-1 line-clamp-2 text-xs text-zinc-500">
            {activeItem?.description ||
              "Item details will appear here once linked to a listing."}
          </div>

          <div className="mt-3 flex items-center gap-2 border-t border-zinc-100 pt-3 text-xs font-medium text-zinc-700">
            <FaMapMarkerAlt className="text-emerald-600" />
            {activeItem?.hubLocation || "Location"}
          </div>
        </div>
      </div>
    </div>

    {/* You can keep your Exchange Status + Safety blocks here too */}
    {/* ... */}
  </div>

            {/* Status (UI only for now) */}
            <div className="border-b border-zinc-100 p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Exchange Status
              </div>

              <div className="mt-4 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-[11px] font-bold text-zinc-900">
                    ✓
                  </div>
                  <div>
                    <div className="font-bold text-zinc-900">Request Sent</div>
                    <div className="text-[11px] text-zinc-500">
                      A request was made for this item
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-emerald-500/15 text-[11px] font-bold text-zinc-900 ring-1 ring-emerald-500/20">
                    ⏱
                  </div>
                  <div>
                    <div className="font-bold text-zinc-900">Meet-up Proposed</div>
                    <div className="text-[11px] text-zinc-500">
                      Waiting for confirmation
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 opacity-60">
                  <div className="mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-zinc-200 text-[11px] font-bold text-zinc-700">
                    🤝
                  </div>
                  <div>
                    <div className="font-bold text-zinc-900">Complete</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety */}
            <div className="p-4">
              <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
                <div className="text-[10px] font-bold uppercase text-amber-700">
                  Safety Tip
                </div>
                <div className="mt-1 text-[11px] text-amber-700">
                  Always meet in a well-lit public place. Let someone know your
                  location.
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}