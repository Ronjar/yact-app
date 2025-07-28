<script lang="ts">
    import * as Card from "$lib/components/shadcn/card/index.js";
	import { Button } from "$lib/components/shadcn/button/index.js";
	import { toast } from 'svelte-sonner';
    import TrashIcon from "@lucide/svelte/icons/trash-2";
    import type { Message } from "$lib/server/types";

	let { message, currentUserId, onDelete }: { message: Message; currentUserId: string; onDelete?: (id: string) => void } = $props();

	const isSelf = $derived(message.authorId === currentUserId);

	function copy() {
		navigator.clipboard.writeText(message.text).then(() => toast.success('Text copied!'));
	}

	function handleDelete(e: MouseEvent) {
		e.stopPropagation();
		onDelete?.(message.id);
	}
</script>

<Card.Root
	class={`cursor-pointer flex flex-row items-center h-20 group shadow-none transition-colors prose hover:border-2 bg-white dark:bg-slate-800 max-w-none ${isSelf ? 'hover:border-green-500 hover:dark:border-green-800' : 'hover:border-gray-400 '}`}
	onclick={copy}
>
	<Card.Content class="w-full">
		<div class="flex flex-row items-center justify-between">
            <div class="flex-grow truncate">
			    {message.text}
            </div>

			{#if isSelf}
				<Button
					class="opacity-0 group-hover:opacity-100 cursor-pointer"
					variant="destructive"
					size="icon"
					onclick={handleDelete}
				>
					<TrashIcon />
				</Button>
			{/if}
		</div>
	</Card.Content>
</Card.Root>