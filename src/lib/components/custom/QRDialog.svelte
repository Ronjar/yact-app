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

    function closeAndDelete() {
        open = false;
        onCloseEvent?.();
    }
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="p-8 w-fit rounded-md" onInteractOutside={closeDialog} showCloseButton={false}>
        <p class="text-xl font-bold mb-4">Scan to join the session</p>
        <div class="p-2 sm:p-8 rounded-xl bg-white">
            <QrCode value={link} size="500" />
        </div>
        <div class="flex flex-row gap-4 mt-8">
        <Button class="flex-1/2 md:text-xl md:h-12" onclick={closeDialog}>Close</Button>
        <Button class="flex-1/2 md:text-xl md:h-12" variant="destructive" onclick={closeAndDelete}>Close and delete invite</Button>
        </div>
    </Dialog.Content>
</Dialog.Root>
