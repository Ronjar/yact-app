<script lang="ts">
  import { onMount } from "svelte";
  import io from "socket.io-client";
  import JoinOrCreate from "$lib/components/custom/JoinOrCreate.svelte";
  import MessagesLayout from "$lib/components/custom/MessagesLayout.svelte";
  import SessionOverview from "$lib/components/custom/SessionOverview.svelte";
  import * as Card from "$lib/components/shadcn/card/index.js";
  import Button from "$lib/components/shadcn/button/button.svelte";
  import { sessionMeta } from "$lib/stores/session";

  import type { Message, User } from "$lib/server/types";

  import { toast } from "svelte-sonner";
  import UserOverview from "$lib/components/custom/UserOverview.svelte";

  type Phase = "idle" | "pending" | "chat";

  export let data: { autoResume: { userId: string; sessionId: string } | null };

  let joinOrCreate: JoinOrCreate;
  let phase: Phase = "idle";
  let sessionCode = "";
  let currentUserId = data.autoResume?.userId ?? "";
  let currentUserName = "";
  let adminId = "";
  let messages: Message[] = [];
  let users: User[] = [];

  const WS_PATH = "/api/socket";
  let socket: ReturnType<typeof io> | null = null;

  async function createSession() {
    const res = await fetch("/api/session/create", { method: "POST" });
    if (!res.ok) return toast.error("Cannot create session");
    const d = await res.json();
    sessionCode = d.sessionCode;
    adminId = d.adminId;
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
      toast.error("Session not found!");
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

    socket.on("session:init", (p) => {
      sessionCode = p.code;
      adminId = p.adminId;
      users = p.users;
      currentUserName = p.name;
      sessionMeta.set({ code: sessionCode, adminId });
    });

    socket.on("messages:init", (history: Message[]) => {
      messages = history;
      phase = "chat";
    });

    socket.on("session:init", () => {});

    socket.on("messages:added", (msg: Message) => {
      messages = [...messages, msg];
    });

    socket.on("messages:deleted", (id: string) => {
      messages = messages.filter((m) => m.id !== id);
    });

    socket.on("verification:pending", () => {
      phase = "pending";
    });
    /*
    socket.on("verification:request", ({ userId }) => {
      if (confirm(`Allow user ${userId} to join?`)) {
        socket!.emit("verification:respond", { userId, accept: true });
      } else {
        socket!.emit("verification:respond", { userId, accept: false });
      }
    });*/

    socket.on("verification:result", (verified: boolean) => {
      if (verified) {
        phase = "chat";
        toast.success("Joined session");
      } else {
        toast.error("Session access rejected");
        resetEverything();
      }
    });

    socket.on("verification:request", (u) => (users = [...users, u]));
    socket.on(
      "user:updated",
      (u) => (users = users.map((x) => (x.id === u.id ? u : x))),
    );

    socket.on(
      "user:removed",
      ({ userId }) => {
        if(currentUserId == userId) {
          resetEverything();
        } else {
        (users = users.filter((u) => u.id !== userId));
        }
      },
    );

    socket.on("session:deleted", () => {
      toast.error("Session closed");
      resetEverything();
    });

    socket.on("disconnect", () => {});
  }

  function resetEverything() {
    phase = "idle";
    messages = [];
    socket?.disconnect();
    socket = null;
    sessionCode = "";
    sessionMeta.set({ code: undefined, adminId: undefined });
  }

  function addMessage(text: string) {
    socket?.emit("messages:add", text);
  }
  function deleteMessage(id: string) {
    socket?.emit("messages:delete", id);
  }

  function accept(id: string) {
    socket?.emit("verification:respond", { userId: id, accept: true });
  }
  function reject(id: string) {
    socket?.emit("verification:respond", { userId: id, accept: false });
  }
  function remove(id: string) {
    socket?.emit("user:delete", id);
  }

  function deleteSession() {
    socket?.emit("session:delete");
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
    <JoinOrCreate
      bind:this={joinOrCreate}
      onJoin={joinSession}
      onCreate={createSession}
    />
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
{:else}
  <div class="flex flex-1 h-full">
    <div class="flex-1 overflow-auto p-4">
      <MessagesLayout
        {messages}
        {currentUserId}
        onCreate={addMessage}
        onDelete={deleteMessage}
      />
    </div>

    <div class="p-4">
    {#if currentUserId === adminId}
      <SessionOverview
        {users}
        onAccept={accept}
        onReject={reject}
        onRemove={remove}
        onDeleteSession={deleteSession}
      />
    {:else}
      <UserOverview
        name={currentUserName}
        onDelete={() => remove(currentUserId)}
      />
    {/if}
    </div>
  </div>
{/if}
