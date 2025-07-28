<script lang="ts">
    import LogOutIcon from "@lucide/svelte/icons/log-out";
    import Button from "../shadcn/button/button.svelte";
    import * as Card from "$lib/components/shadcn/card/index.js";

    interface Props {
        name: string;
        onDelete: () => void;
    }

    let { name, onDelete }: Props = $props();
</script>

<Card.Root>
    <Card.Header>
        You are: <br>
        <b>{name}</b>
    </Card.Header>
    <Card.Content>
        <Button
            class="w-full flex flex-row items-center"
            variant="destructive"
            onclick={onDelete}
        >
            <LogOutIcon />
            Exit Session
        </Button>
    </Card.Content>
</Card.Root>
