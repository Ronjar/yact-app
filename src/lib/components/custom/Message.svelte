<script lang="ts" generics="T extends { id: string; author: string; content: string }">
    import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { toast } from 'svelte-sonner';
    import TrashIcon from "@lucide/svelte/icons/trash-2";
    import type { MsgRecord } from "$lib/scripts/pb";

	let { message, currentUserId, onDelete }: { message: MsgRecord; currentUserId: string; onDelete?: (id: string) => void } = $props();

	const isSelf = $derived(message.author === currentUserId);

	function copy() {
		// write raw HTML to clipboard
		navigator.clipboard.writeText(message.content).then(() => toast.success('Kopiert!'));
	}

	function handleDelete(e: MouseEvent) {
		e.stopPropagation();
		onDelete?.(message.id);
	}
</script>

<Card.Root
	class={`cursor-pointer group shadow-none transition-colors prose hover:border-gray-400 max-w-none ${isSelf ? 'bg-green-50 dark:bg-green-950' : 'bg-white dark:bg-slate-800'}`}
	onclick={copy}
>
	<Card.Content>
		<div class="flex flex-row">
            <div class="flex-grow">
			    {@html message.content}
            </div>

			{#if isSelf}
				<Button
					class="opacity-0 group-hover:opacity-100"
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