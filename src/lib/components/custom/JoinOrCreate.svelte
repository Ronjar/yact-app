<script lang="ts">
    import * as Card from "$lib/components/shadcn/card/index.js";
    import Button from "../shadcn/button/button.svelte";
    import * as InputOTP from "../shadcn/input-otp";
    import Separator from "../shadcn/separator/separator.svelte";

    const CODE_LENGTH = 6;

    let { onJoin, onCreate}: { onJoin: (code: string) => void; onCreate: () => void } = $props();
    let code = $state("");

    export function reset(){
        code = "";
    }

    $effect(() => {
        if(code?.length >= CODE_LENGTH){
            onJoin(code)
        }
    })

</script>

<Card.Root class="flex flex-col items-center w-full max-w-lg px-10">
    <Card.Header
        class="flex flex-col text-xl text-center font-bold w-lg items-center"
        >Create or Join a session</Card.Header
    >
    <Card.Content class="p-2 w-fit rounded-md mx-auto">
        <p class="opacity-60 text-sm">Enter a session's code to join</p>
        <InputOTP.Root maxlength={CODE_LENGTH} bind:value={code}>
            {#snippet children({ cells })}
                <InputOTP.Group>
                    {#each cells as cell (cell)}
                        <InputOTP.Slot {cell} />
                    {/each}
                </InputOTP.Group>
            {/snippet}
        </InputOTP.Root>
        <Separator class="my-4"/>
        <Button class="w-full" onclick={onCreate}>Create a session</Button>
    </Card.Content>
</Card.Root>