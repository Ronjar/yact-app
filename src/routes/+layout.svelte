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
	import { version } from "$app/environment";
	import * as Dialog from "$lib/components/shadcn/dialog/index.js";
	import Separator from "$lib/components/shadcn/separator/separator.svelte";

	let code: string | undefined = $state();
	sessionMeta.subscribe(({ code: c }) => (code = c));

	let aboutDialog = $state(false);

	function dialogChange(state: boolean) {
		if (!state) {
			aboutDialog = false;
		}
	}

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
<div class="h-screen flex flex-col">
	<header
		class="flex h-18 w-full justify-between gap-2 items-center px-4 shadow-md z-10"
	>
		<Button
			variant="ghost"
			class="flex flex-row items-center gap-2 cursor-pointer rounded-xl py-6"
		>
			<img
				alt="YACT logo"
				class="size-8 bg-white rounded-lg p-1"
				src={logo}
			/>
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
	</header>
	<main class="flex-1 lg:min-h-0 lg:overflow-hidden">
		<Toaster richColors position="top-center" />
		{@render children?.()}
	</main>

	<footer class="w-full text-end">
		<p class="text-sm opacity-50 pr-2">
			<Button
				variant="link"
				class="p-0 underline cursor-pointer"
				onclick={() => {
					aboutDialog = true;
				}}>YACT v{version}</Button
			> |
			<a class="hover:underline" href="https://github.com/Ronjar/yact-app"
				>GitHub</a
			>
		</p>
	</footer>

	<Dialog.Root open={aboutDialog} onOpenChangeComplete={dialogChange}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title class="text-xl">About YACT {version}</Dialog.Title
				>
				<Dialog.Description class="text-md">
					<Separator class="my-4" />
					YACT (Yet Another Clipboard Tool) is built by me
					<a href="https://robingebert.com" target="_blank">Robin</a
					>.<br />
					If you encounter any issues or have any feature requests, please
					report them on
					<a
						href="https://github.com/Ronjar/yact-app/issues"
						target="_blank">GitHub Issues</a
					>.<br /><br />
					This project would not be possible without many open source projects.
					A big thank you to all the creators of these projects. The Licenses
					of those projects can be viewed here:<br />
					<a href="https://github.com/Ronjar/yact-app/ossLicenses.txt"
						>LICENSES</a
					>
				</Dialog.Description>
			</Dialog.Header>
			<Dialog.Footer class="text-sm opacity-50 mt-12">
				Thank you for using YACT ❤️<br />
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
</div>
