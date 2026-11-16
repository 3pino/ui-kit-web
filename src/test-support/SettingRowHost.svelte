<script lang="ts">
  // parity.test.ts 用の入れ物（テストのためだけ）。SettingRow に、右側の操作（トグル）を snippet で渡す
  import SettingRow from '../SettingRow.svelte';
  import Toggle from '../Toggle.svelte';

  let { name, description, icon, withControl }: { name: string; description?: string; icon?: string; withControl?: boolean } = $props();
</script>

{#if withControl}
  <SettingRow {name} {description} {icon}>
    {#snippet control()}<Toggle checked={true} label="有効" />{/snippet}
  </SettingRow>
{:else}
  <SettingRow {name} {description} {icon} />
{/if}
