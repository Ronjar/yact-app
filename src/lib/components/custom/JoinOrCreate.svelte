<script lang="ts">
    import * as Card from "$lib/components/shadcn/card/index.js";
    import Button from "../shadcn/button/button.svelte";
    import * as InputOTP from "../shadcn/input-otp";
    import Separator from "../shadcn/separator/separator.svelte";
    import { env } from "$env/dynamic/public";

    const CODE_LENGTH = parseInt(env.PUBLIC_SESSION_CODE_LENGTH ?? "6");

    let {
        onJoin,
        onCreate,
    }: { onJoin: (code: string) => void; onCreate: () => void } = $props();
    let code = $state("");

    //let input: HTMLDivElement;

    export function reset() {
        code = "";
    }

    $effect(() => {
        if (code?.length >= CODE_LENGTH) {
            onJoin(code);
        }
    });
</script>

<Card.Root class="flex flex-col items-center md:w-lg lg:px-10">
    <Card.Header
        class="flex flex-col md:text-xl text-center font-bold w-sm md:w-lg items-center"
        >Create or Join a session</Card.Header
    >
    <Card.Content class="p-2 w-fit rounded-md mx-auto">
        <p class="opacity-60 text-sm">Enter a session's code to join</p>
        <InputOTP.Root
            autocomplete="off"
            class="md:scale-125 my-5 justify-center"
            maxlength={CODE_LENGTH}
            bind:value={code}
        >
            {#snippet children({ cells })}
                <InputOTP.Group>
                    {#each cells as cell (cell)}
                        <InputOTP.Slot class="text-xl" {cell} />
                    {/each}
                </InputOTP.Group>
            {/snippet}
        </InputOTP.Root>
        <Separator class="mt-6 mb-4" />
        <Button
            class="w-full cursor-pointer md:text-xl md:h-12"
            onclick={onCreate}>Create a session</Button
        >
    </Card.Content>
</Card.Root>
