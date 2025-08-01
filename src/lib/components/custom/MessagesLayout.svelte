<script lang="ts">
    import {default as MessageCard} from "./Message.svelte";
    import SendIcon from "@lucide/svelte/icons/send";
    import FileIcon from "@lucide/svelte/icons/file-plus";
    import * as Card from "$lib/components/shadcn/card/index.js";
    import { Button } from "$lib/components/shadcn/button/index.js";
    import { Input } from "$lib/components/shadcn/input/index.js";
    import { tick } from "svelte";
    import type { Message } from "$lib/server/types";
    import Label from "../shadcn/label/label.svelte";

    let {
        messages = [],
        currentUserId,
        onCreate,
        onDelete,
		onShare,
		onUpload               //  ←  NEU
	}: {
		messages: Message[];
		currentUserId: string;
		onCreate: (text: string) => void;
		onDelete: (id: string) => void;
		onShare: (msg: Message) => void;
		onUpload: (file: File) => void;
	} = $props();

	let draft = $state("");
    let fileInput!: HTMLInputElement;

    async function createMessage() {
        if (!draft.trim()) return;
        onCreate(draft);
        draft = "";
        await tick();
		document.getElementById('draft')?.focus();
	}

    function openFileDialog() {
        fileInput.click();
    }

	async function handleFile(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		await onUpload(file);
		fileInput.value = '';
    }
</script>

<div class="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
    <Card.Root class="col-span-1 sm:col-span-2 xl:col-span-3 group shadow-none">
        <Card.Content>
            <form class="flex w-full items-center space-x-2">
                <Button class="cursor-pointer" size="icon" onclick={openFileDialog}><FileIcon/></Button>
                <input type="file" bind:this={fileInput} hidden onchange={handleFile} />
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
