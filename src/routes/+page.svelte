<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import io from "socket.io-client";
  import JoinOrCreate from "$lib/components/custom/JoinOrCreate.svelte";
  import MessagesLayout from "$lib/components/custom/MessagesLayout.svelte";
  import * as Card from "$lib/components/shadcn/card/index.js";
  import Button from "$lib/components/shadcn/button/button.svelte";

  import type { Message } from "$lib/server/types";
    import { toast } from "svelte-sonner";

  type Phase = "idle" | "pending" | "chat";

  export let data: { autoResume: { userId: string; sessionId: string } | null };

  let joinOrCreate: JoinOrCreate;
  let phase: Phase = "idle";
  let sessionCode = "";
  let currentUserId = data.autoResume?.userId ?? "";
  let messages: Message[] = [];
  const WS_PATH = "/api/socket";
  let socket: ReturnType<typeof io> | null = null;

  async function createSession() {
    const res = await fetch("/api/session/create", { method: "POST" });
    if (!res.ok) return alert("Could not create session");
    const data = await res.json();
    sessionCode = data.sessionCode;
    connectSocket();
  }

  async function joinSession(code: string) {
    const res = await fetch("/api/session/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) {
      joinOrCreate.reset();
      toast.error('Session not found!')
      return;
    }
    const data = await res.json();
    currentUserId = data.userId;
    connectSocket();
  }

  function connectSocket() {
    socket?.disconnect();
    socket = io({
      path: WS_PATH,
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("socket connected", socket!.id);
    });

    socket.on("messages:init", (history: Message[]) => {
      messages = history;
      phase = "chat";
    });

    socket.on("messages:added", (msg: Message) => {
      messages = [...messages, msg];
    });

    socket.on("messages:deleted", (id: string) => {
      messages = messages.filter((m) => m.id !== id);
    });

    socket.on("verification:pending", () => {
      phase = "pending";
    });

    socket.on("verification:request", ({ userId }) => {
      if (confirm(`Allow user ${userId} to join?`)) {
        socket!.emit("verification:respond", { userId, accept: true });
      } else {
        socket!.emit("verification:respond", { userId, accept: false });
      }
    });

    socket.on("verification:result", (verified: boolean) => {
      if(verified) {
        phase = "chat";
        toast.success("Joined session");
      } else {
        toast.error("Session access rejected");
        resetEverything();
      }
    });

    socket.on("session:deleted", () => {
      alert("Session was closed by admin");
      resetEverything();
    });

    socket.on("disconnect", () => {});
  }

  function resetEverything() {
    phase = "idle";
    messages = [];
    socket?.disconnect();
    socket = null;
  }

  function addMessage(text: string) {
    socket?.emit("messages:add", text);
  }
  function deleteMessage(id: string) {
    socket?.emit("messages:delete", id);
  }

  onMount(() => {
    if (data.autoResume) {
      phase = "pending";
      connectSocket();
    }
    return () => socket?.disconnect();
  });
</script>

{#if phase === "idle"}
  <div class="m-96 flex items-center justify-center">
    <JoinOrCreate bind:this={joinOrCreate} onJoin={joinSession} onCreate={createSession} />
  </div>
{:else if phase === "pending"}
  <div class="h-screen flex flex-col items-center justify-center gap-4">
    <Card.Root class="p-8 text-center max-w-md">
      <Card.Header class="text-xl font-bold"
        >Waiting for verification …</Card.Header
      >
      <Card.Content>
        {#if sessionCode}
          <p class="mb-2">Session code: <strong>{sessionCode}</strong></p>
        {/if}
        <p>Ask the session admin to approve your request.</p>
      </Card.Content>
      <Card.Footer>
        <Button onclick={resetEverything}>Cancel</Button>
      </Card.Footer>
    </Card.Root>
  </div>
{:else if phase === "chat"}
  <div class="p-4 max-w-7xl mx-auto">
    <MessagesLayout
      {messages}
      {currentUserId}
      onCreate={addMessage}
      onDelete={deleteMessage}
    />
  </div>
{/if}
