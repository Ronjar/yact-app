<script lang="ts">
  import { onMount } from "svelte";
  import io from "socket.io-client";
  import JoinOrCreate from "$lib/components/custom/JoinOrCreate.svelte";
  import MessagesLayout from "$lib/components/custom/MessagesLayout.svelte";
  import SessionOverview from "$lib/components/custom/SessionOverview.svelte";
  import { sessionMeta } from "$lib/stores/session";

  import type { Message, User } from "$lib/server/types";

  import { toast } from "svelte-sonner";
  import UserOverview from "$lib/components/custom/UserOverview.svelte";
  import VerificationPending from "$lib/components/custom/VerificationPending.svelte";
  import QrDialog from "$lib/components/custom/QRDialog.svelte";

  type Phase = "idle" | "pending" | "chat";

  export let data: { autoResume: { userId: string; sessionId: string } | null };

  let joinOrCreate: JoinOrCreate;
  let phase: Phase = "idle";
  let sessionCode = "";
  let currentUserId = data.autoResume?.userId ?? "";
  let currentUserName = "";
  let isAdmin = false;
  let messages: Message[] = [];
  let users: User[] = [];

  let qrDialog: QrDialog;

  const WS_PATH = "/api/socket";
  let socket: ReturnType<typeof io> | null = null;

  async function createSession() {
    const res = await fetch("/api/session/create", { method: "POST" });
    if (!res.ok) return toast.error("Cannot create session");
    if (res.ok) {
      connectSocket();
    } else {
      joinOrCreate.reset();
      toast.error("Failed to create session");
    }
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
      isAdmin = p.isAdmin;
      users = p.users;
      currentUserName = p.name;
      currentUserId = p.userId;
      sessionMeta.set({ code: sessionCode, isAdmin: isAdmin });
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

    socket.on("user:added", (u) => {
      users = [...users, u];
      qrDialog.closeDialog();
    });
    socket.on(
      "user:updated",
      (u) => (users = users.map((x) => (x.id === u.id ? u : x))),
    );

    socket.on("user:removed", ({ userId }) => {
      if (currentUserId == userId) {
        resetEverything();
      } else {
        users = users.filter((u) => u.id !== userId);
      }
    });

    socket.on("session:deleted", () => {
      toast.error("Session closed");
      resetEverything();
    });

    socket.on("disconnect", () => {});
  }

  async function resetEverything() {
    phase = "idle";
    messages = [];
    socket?.disconnect();
    socket = null;
    sessionCode = "";
    sessionMeta.set({ code: undefined, isAdmin: undefined });
    await fetch("?/resetAuth", { method: "POST", body: new URLSearchParams() });
  }

  function addMessage(text: string) {
    socket?.emit("messages:add", text);
  }
  function deleteMessage(id: string) {
    socket?.emit("messages:delete", id);
  }

  function shareMessage(text: string) {
    socket?.emit("share:create", text , (url: string) => {
      navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    });
  }

  function acceptUser(id: string) {
    socket?.emit("verification:respond", { userId: id, accept: true });
  }
  function rejectUser(id: string) {
    socket?.emit("verification:respond", { userId: id, accept: false });
  }
  function removeUser(id: string) {
    socket?.emit("user:delete", id);
  }

  function inviteUser() {
    socket?.emit("invite:create", (token: string, url: string) => {
      if (token && token.length > 0) {
        qrDialog.openDialog(url, () => {
          deleteInvite(token);
        });
      } else {
        toast.error("Failed to create invite");
      }
    });
  }

  function deleteInvite(token: string) {
    socket?.emit("invite:delete", token, (ok: boolean) => {
      if (ok) {
        toast.success("Invite deleted");
      } else {
        toast.error("Failed to delete invite");
      }
    });
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

<svelte:head>
	<title>YACT</title>
	<meta name="description" content="YACT (yet another clipboard tool) creates a simple, browser based board to share data between devices in the same session" />
</svelte:head>

{#if phase === "idle"}
  <div class="mt-40 md:mt-72 flex items-center justify-center">
    <JoinOrCreate
      bind:this={joinOrCreate}
      onJoin={joinSession}
      onCreate={createSession}
    />
  </div>
{:else if phase === "pending"}
  <div class="mt-40 md:mt-72 flex items-center justify-center">
    <VerificationPending onCancel={resetEverything} />
  </div>
{:else}
  <div class="flex flex-col md:flex-row h-full">
    <div class="flex-5/6 overflow-auto p-4">
      <MessagesLayout
        {messages}
        {currentUserId}
        onCreate={addMessage}
        onDelete={deleteMessage}
        onShare={shareMessage}
      />
    </div>

    <div class="flex-1/6 p-4">
      {#if isAdmin}
        <SessionOverview
          name={currentUserName}
          {users}
          onAccept={acceptUser}
          onReject={rejectUser}
          onRemove={removeUser}
          onCreateInvite={inviteUser}
          onDeleteSession={deleteSession}
        />
        <QrDialog bind:this={qrDialog} />
      {:else}
        <UserOverview
          name={currentUserName}
          onDelete={() => removeUser(currentUserId)}
        />
      {/if}
    </div>
  </div>
{/if}
