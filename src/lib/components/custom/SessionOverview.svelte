<script lang="ts">
    import Check from "@lucide/svelte/icons/check";
    import X from "@lucide/svelte/icons/x";
    import Trash from "@lucide/svelte/icons/trash";
    import Separator from "../shadcn/separator/separator.svelte";
    import Button from "../shadcn/button/button.svelte";

    export interface User {
        id: string;
        name: string;
        isVerified: boolean;
    }

    interface Props {
        users: User[];
        onAccept: (id: string) => void;
        onReject: (id: string) => void;
        onRemove: (id: string) => void;
        onDeleteSession: () => void;
    }

    let { users, onAccept, onReject, onRemove, onDeleteSession }: Props =
        $props();
</script>

<aside class="w-64 p-4 border-l h-[90vh] flex flex-col gap-4">
    <h2 class="text-lg font-bold mb-2">Users</h2>

    <div class="flex flex-col justify-between h-full">
        <div>
            <Separator class="my-1" />
            {#each users as u (u.id)}
                <div class="group flex justify-between items-center py-1">
                    <span class={!u.isVerified ? "italic opacity-60" : ""}
                        >{u.name}</span
                    >

                    {#if !u.isVerified}
                        <div class="flex gap-1">
                            <Button
                                class="size-10 opacity-0 group-hover:opacity-100 cursor-pointer"
                                variant="default"
                                onclick={() => onAccept(u.id)}
                                title="accept"><Check size="18" /></Button
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
                            title="remove"><Trash size="18" /></Button
                        >
                    {/if}
                </div>
            <Separator class="my-1" />
            {/each}
        </div>
            <Button
                class="w-full"
                variant="destructive"
                onclick={onDeleteSession}
            >
                Delete Session
            </Button>
    </div>
</aside>