<script lang="ts">
	import * as Card from "$lib/components/shadcn/card/index.js";
	import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
	import { Button } from "$lib/components/shadcn/button/index.js";
	import { toast } from "svelte-sonner";
	import ShareIcon from "@lucide/svelte/icons/share-2";
	import FileTextIcon from "@lucide/svelte/icons/file-text";
	import TrashIcon from "@lucide/svelte/icons/trash";
	import EllipsisVerticalIcon from "@lucide/svelte/icons/ellipsis-vertical";
	import type { Message } from "$lib/server/types";
    import { env } from "$env/dynamic/public";

    const BASE_URL = env.PUBLIC_BASE_URL?? "";

	let {
		message,
		currentUserId,
		onDelete,
		onShare,
	}: {
		message: Message;
		currentUserId: string;
		onDelete?: (id: string) => void;
		onShare: (msg: Message) => void;
	} = $props();

	const isSelf = $derived(message.authorId === currentUserId);

	async function handleCopy() {
		try {
			if (message.kind === "text") {
				await navigator.clipboard.writeText(message.text!);
				toast.success("Text copied!");
				return;
			}

			const a = document.createElement("a");
			a.href = message.url!;
			a.download = message.name ?? "download";
			document.body.appendChild(a);
			a.click();
			a.remove();
			toast.success("Download started");
			return;

			//const blob = await fetch(message.url!).then(r => r.blob());
			//await navigator.clipboard.write([ new ClipboardItem({ [blob.type]: blob }) ]);
			//toast.success('File copied!');
		} catch {
			await navigator.clipboard.writeText(BASE_URL + message.url!);
			toast.info("Copied link (file-clipboard blocked).");
		}
	}

	function handleShare(e: MouseEvent) {
		e.stopPropagation();
		onShare(message);
	}

	function handleDelete(e: MouseEvent) {
		e.stopPropagation();
		onDelete?.(message.id);
	}
</script>

<Card.Root
	class={`cursor-pointer flex flex-row items-center h-20 group shadow-none transition-colors prose hover:border-2 bg-white dark:bg-slate-800 max-w-none ${isSelf ? "hover:border-slate-600 hover:dark:border-slate-800" : "hover:border-gray-400 "}`}
	onclick={handleCopy}
>
	<Card.Content class="w-full">
		<div class="flex flex-row items-center justify-between">
			{#if message.kind === "image"}
				<img
					src={message.url}
					alt="img"
					class="size-10 object-cover rounded"
				/>
			{:else if message.kind === "video"}
				<video
					src={message.url}
					class="size-10 object-cover rounded"
					muted
				></video>
			{:else if message.kind === "file"}
				<div class="flex items-center gap-1">
					<FileTextIcon class="size-8" /><span
						class="truncate max-w-[10rem]">{message.name}</span
					>
				</div>
			{:else}
				<span class="truncate">{message.text}</span>
			{/if}

			{#if isSelf}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button
								{...props}
								class="cursor-pointer"
								size="icon"><EllipsisVerticalIcon /></Button
							>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-56" align="start">
						<DropdownMenu.Group>
							<DropdownMenu.Item
								class="flex flex-row cursor-pointer"
								onclick={handleShare}
							>
								<ShareIcon />
								Share
							</DropdownMenu.Item>
							<DropdownMenu.Item
								class="flex flex-row cursor-pointer"
								variant="destructive"
								onclick={handleDelete}
							>
								<TrashIcon />
								Delete
							</DropdownMenu.Item>
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{:else}
				<Button
					class="cursor-pointer"
					size="icon"
					onclick={handleShare}
				>
					<ShareIcon />
				</Button>
			{/if}
		</div>
	</Card.Content>
</Card.Root>
