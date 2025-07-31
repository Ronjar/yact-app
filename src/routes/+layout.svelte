<script lang="ts">
	import "../app.css";
	import logo from "../yact.png";
	import { ModeWatcher } from "mode-watcher";
	import ThemeToggle from "$lib/components/custom/ThemeToggle.svelte";
	import { Toaster } from "$lib/components/shadcn/sonner/index.js";
	import { sessionMeta } from "$lib/stores/session";
	import Button from "$lib/components/shadcn/button/button.svelte";
	import ClipboardIcon from "@lucide/svelte/icons/clipboard-list";
	import { toast } from "svelte-sonner";

	let code: string | undefined = $state();
	sessionMeta.subscribe(({ code: c }) => (code = c));

	let { children } = $props();

	function copy() {
		if (code !== undefined) {
			navigator.clipboard
				.writeText(code)
				.then(() => toast.success("Session code copied!"));
		}
	}
</script>

<ModeWatcher />

<div
	class="flex h-18 w-full justify-between gap-2 items-center px-4 shadow-md fixed top-0"
>
	<Button variant="ghost" class="flex flex-row items-center gap-2 cursor-pointer rounded-xl py-6">
		<img alt="YACT logo" class="size-8 bg-white rounded-lg p-1" src={logo} />
		<h1 class="text-2xl font-bold">Yact</h1>
	</Button>

	{#if code}
		<Button
			onclick={copy}
			variant="ghost"
			class="group cursor-pointer flex flex-row items-center gap-2 font-mono text-2xl p-6"
			>{code}<ClipboardIcon
				class="size-6 pb-1 opacity-0 transition-opacity group-hover:opacity-75 cursor-pointer"
			/></Button
		>
	{/if}

	<ThemeToggle />
</div>

<Toaster richColors position="top-center" />
<main class="size-full mt-20">
	{@render children?.()}
</main>
