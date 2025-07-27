<script lang="ts">
    import Message from "./Message.svelte";
    import SendIcon from "@lucide/svelte/icons/send";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { tick } from "svelte";
    import { pb, type MsgRecord } from "$lib/scripts/pb";

    let {
        messages = [],
        currentUserId,
    }: { messages: MsgRecord[]; currentUserId: string } = $props();

    let draft = $state("");

    async function createMessage() {
        if (!draft.trim()) return;
        await pb
            .collection("messages")
            .create({ content: draft, author: currentUserId });
        draft = "";
        await tick();
        document.getElementById("draft")?.focus();
    }

    async function deleteMessage(id: string) {
        await pb.collection("messages").delete(id);
        messages = messages.filter((m) => m.id !== id);
    }
</script>

<div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
    <Card.Root class="col-span-1 sm:col-span-2 lg:col-span-3 group shadow-none">
        <Card.Content>
            <form class="flex w-full items-center space-x-2">
                <Input
                    id="draft"
                    type="text"
                    class="grow"
                    placeholder="Type something"
                    bind:value={draft}
                    onkeydown={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), createMessage())}
                />
                <Button type="submit" onclick={createMessage}><SendIcon/></Button>
            </form>
        </Card.Content>
    </Card.Root>

    {#each [...messages].reverse() as msg (msg.id)}
        <Message message={msg} {currentUserId} onDelete={deleteMessage} />
    {/each}
</div>
