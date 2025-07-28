<script lang="ts">
    import * as Card from "$lib/components/shadcn/card/index.js";
    import Button from "../shadcn/button/button.svelte";

    let { onCancel }: { onCancel: () => void } = $props();
</script>

<Card.Root class="flex flex-col items-center md:w-lg lg:px-10">
    <Card.Header
        class="flex flex-col md:text-xl text-center font-bold w-sm md:w-lg items-center"
        >Waiting for verification …</Card.Header
    >
    <Card.Content class="p-2 w-fit rounded-md mx-auto">
        <p>Ask the session admin to approve your request.</p>
    </Card.Content>
    <Card.Footer class="w-full">
        <Button
            class="w-full cursor-pointer md:text-xl md:h-12"
            onclick={onCancel}
            >Cancel
        </Button>
    </Card.Footer>
</Card.Root>
