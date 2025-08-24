<script lang="ts">
    import Check from "@lucide/svelte/icons/check";
    import X from "@lucide/svelte/icons/x";
    import TrashIcon from "@lucide/svelte/icons/trash";
    import PlusIcon from "@lucide/svelte/icons/plus";
    import Separator from "../shadcn/separator/separator.svelte";
    import Button from "../shadcn/button/button.svelte";
    import * as Card from "$lib/components/shadcn/card/index.js";

    export interface User {
        id: string;
        name: string;
        isVerified: boolean;
    }

    interface Props {
        name: string;
        users: User[];
        onAccept: (id: string) => void;
        onReject: (id: string) => void;
        onRemove: (id: string) => void;
        onCreateInvite: () => void;
        onDeleteSession: () => void;
    }

    let {
        name,
        users,
        onAccept,
        onReject,
        onRemove,
        onCreateInvite,
        onDeleteSession,
    }: Props = $props();
</script>

<Card.Root class="lg:h-[85vh] flex flex-col gap-4">
    <Card.Header>
        You are: <br />
        <span class="text-xl font-bold">{name}</span>
    </Card.Header>
    <Card.Content class="h-full">
        <Separator />
        <h2 class="text-md font-bold mt-4 mb-2">Users:</h2>

        <div class="flex flex-col justify-between h-full">
            <div>
                {#each users as u (u.id)}
                    {#if u.name !== name}
                        <div
                            class="group flex justify-between items-center py-1"
                        >
                            <span
                                class={!u.isVerified ? "italic opacity-60" : ""}
                                >{u.name}</span
                            >

                            {#if !u.isVerified}
                                <div class="flex gap-1">
                                    <Button
                                        class="size-10 opacity-0 group-hover:opacity-100 cursor-pointer"
                                        variant="default"
                                        onclick={() => onAccept(u.id)}
                                        title="accept"
                                        ><Check size="18" /></Button
                                    >
                                    <Button
                                        class="size-10 opacity-0 group-hover:opacity-100 cursor-pointer"
                                        variant="destructive"
                                        onclick={() => onReject(u.id)}
                                        title="reject"><X size="18" /></Button
                                    >
                                </div>
                            {:else}
                                <Button
                                    class="size-10 opacity-0 group-hover:opacity-100 cursor-pointer"
                                    variant="destructive"
                                    onclick={() => onRemove(u.id)}
                                    title="remove"
                                    ><TrashIcon size="18" /></Button
                                >
                            {/if}
                        </div>
                        <Separator class="my-1" />
                    {/if}
                {/each}
                {#if users.length < 2}
                    <p class="opacity-75">No other users yet</p>
                {/if}
            </div>
        </div>
    </Card.Content>
    <Card.Footer class="flex flex-col gap-4">
        <Button
            class="w-full cursor-pointer md:text-xl md:h-12 flex flex-row items-center justify-center gap-2"
            onclick={onCreateInvite}
        >
            <PlusIcon />
            Invite User
        </Button>
        <Separator />
        <Button
            class="w-full cursor-pointer md:text-xl md:h-12 flex flex-row items-center justify-center gap-2"
            variant="destructive"
            onclick={onDeleteSession}
        >
            <TrashIcon />
            Delete Session
        </Button>
    </Card.Footer>
</Card.Root>
