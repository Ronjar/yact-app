<script lang="ts">
    import QrCode from "svelte-qrcode";
    import * as Dialog from "$lib/components/shadcn/dialog/index.js";
    import Button from "../shadcn/button/button.svelte";

    let open = false;
    let link = "";
    let onCloseEvent: (() => void) | undefined = undefined;

    export function openDialog(url: string, onClose?: () => void) {
        link = url;
        open = true;
        onCloseEvent = onClose;
    }

    export function closeDialog() {
        open = false;
    }

    function closeDialogButton() {
        open = false;
        onCloseEvent?.();
    }
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="p-8 bg-white w-fit rounded-md" onInteractOutside={closeDialogButton}>
        <p class="text-lg mb-8">Scan to join the session</p>
        <QrCode value={link} size="500" />
        <Button class="w-full mt-10" variant="destructive" onclick={closeDialogButton}>Close and delete invite</Button>
    </Dialog.Content>
</Dialog.Root>
