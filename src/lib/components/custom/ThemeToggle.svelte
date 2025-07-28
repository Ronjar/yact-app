<svelte:options runes="{true}" />
<script lang="ts">
 import SunIcon from "@lucide/svelte/icons/sun";
 import MoonIcon from "@lucide/svelte/icons/moon";
 
 import { toggleMode } from "mode-watcher";
 import { Button } from "$lib/components/shadcn/button/index.js";
</script>
 
<Button class="cursor-pointer size-10" onclick={toggleMode} variant="outline" size="icon">
 <SunIcon
  class="h-16 w-16 rotate-0 scale-125 !transition-all dark:-rotate-90 dark:scale-0"
 />
 <MoonIcon
  class="absolute h-16 w-16 rotate-90 scale-0 !transition-all dark:rotate-0 dark:scale-125"
 />
 <span class="sr-only">Toggle theme</span>
</Button>