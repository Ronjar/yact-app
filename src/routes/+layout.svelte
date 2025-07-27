<script lang="ts">
	import "../app.css";
	import { ModeWatcher } from "mode-watcher";
	import ThemeToggle from "$lib/components/custom/ThemeToggle.svelte";
	import { Toaster } from "$lib/components/shadcn/sonner/index.js";
	let { children } = $props();
</script>

<ModeWatcher />

<div class="flex h-14 w-full justify-between gap-2 items-center px-4 shadow-md">
	<h1 class="text-xl font-bold">Sandy</h1>
	<ThemeToggle />
</div>

<Toaster position="top-center" />
{@render children?.()}
