<script lang="ts">
    import {default as MessageCard} from "./Message.svelte";
    import SendIcon from "@lucide/svelte/icons/send";
    import * as Card from "$lib/components/shadcn/card/index.js";
    import { Button } from "$lib/components/shadcn/button/index.js";
    import { Input } from "$lib/components/shadcn/input/index.js";
    import { tick } from "svelte";
    import type { Message } from "$lib/server/types";

    let {
        messages = [],
        currentUserId,
        onCreate,
        onDelete,
        onShare
    }: { messages: Message[]; currentUserId: string, onCreate: (text: string) => void, onDelete: (id: string) => void, onShare: (text: string) => void} = $props();

    let draft = $state("");

    async function createMessage() {
        if (!draft.trim()) return;
        onCreate(draft);
        draft = "";
        await tick();
        document.getElementById("draft")?.focus();
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
                <Button type="submit" class="cursor-pointer" onclick={createMessage}><SendIcon/></Button>
            </form>
        </Card.Content>
    </Card.Root>

    {#each [...messages].reverse() as msg (msg.id)}
        <MessageCard message={msg} {currentUserId} onDelete={onDelete} onShare={onShare} />
    {/each}
</div>
