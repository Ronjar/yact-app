<script lang="ts">
	import * as Card from "$lib/components/shadcn/card/index.js";
	import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
	import { Button } from "$lib/components/shadcn/button/index.js";
	import { toast } from "svelte-sonner";
	import ShareIcon from "@lucide/svelte/icons/share-2";
	import TrashIcon from "@lucide/svelte/icons/trash";
	import EllipsisVerticalIcon from "@lucide/svelte/icons/ellipsis-vertical";
	import type { Message } from "$lib/server/types";

	let {
		message,
		currentUserId,
		onDelete,
		onShare
	}: {
		message: Message;
		currentUserId: string;
		onDelete?: (id: string) => void;
		onShare: (text: string) => void;
	} = $props();

	const isSelf = $derived(message.authorId === currentUserId);

	function handleCopy() {
		navigator.clipboard
			.writeText(message.text)
			.then(() => toast.success("Text copied!"));
	}

	function handleShare(e: MouseEvent){
		e.stopPropagation();
		onShare(message.text);
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
			<div class="flex-grow truncate">
				{message.text}
			</div>

			{#if isSelf}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button {...props}
							class="opacity-0 group-hover:opacity-100 cursor-pointer"
							size="icon"><EllipsisVerticalIcon/></Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-56" align="start">
						<DropdownMenu.Group>
							<DropdownMenu.Item class="flex flex-row" onclick={handleShare}>
								<ShareIcon/>
								Share
							</DropdownMenu.Item>
							<DropdownMenu.Item class="flex flex-row" variant="destructive" onclick={handleDelete}>
								<TrashIcon />
								Delete
							</DropdownMenu.Item>
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{:else}
				<Button
					class="opacity-0 group-hover:opacity-100 cursor-pointer"
					size="icon"
					onclick={handleShare}
				>
					<ShareIcon />
				</Button>
			{/if}
		</div>
	</Card.Content>
</Card.Root>
