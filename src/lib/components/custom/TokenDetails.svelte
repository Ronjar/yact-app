<script lang="ts">
    import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
    import { pb } from "$lib/scripts/pb";

    let { name, content, onLogout }: { name: string; content?: string; onLogout: () => void } = $props();

    function logout() {
        pb.send("api/sandy/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        }).then(() => {
            onLogout();
        }).catch((err) => {
            console.error("Logout failed:", err);
        });
    }
</script>

<Card.Root>
    <Card.Header>
        <Card.Title>{name}</Card.Title>
    </Card.Header>
    <Card.Footer>
        <Button
        class="cursor-pointer w-full"
            variant="destructive"
            onclick={logout}
        >
            Exit Session
        </Button>
    </Card.Footer>
</Card.Root>