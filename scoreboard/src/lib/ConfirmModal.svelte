<script lang="ts">
  let {
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
  }: {
    message: string
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void
    onCancel: () => void
  } = $props()
</script>

<div class="backdrop">
  <div class="card" role="dialog" aria-modal="true" aria-label={message}>
    <p>{message}</p>
    <div class="actions">
      <button class="cancel" onclick={onCancel}>{cancelLabel}</button>
      <button class="confirm" onclick={onConfirm}>{confirmLabel}</button>
    </div>
  </div>
</div>

<style>
  .backdrop {
    position: absolute;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgb(0 0 0 / 0.6);
  }

  .card {
    width: 100%;
    max-width: 24rem;
    margin-inline: 1rem;
    padding: 1.5rem;
    border-radius: 8px;
    background: var(--color-mist-900);
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
  }

  p {
    margin: 0 0 1.5rem;
    text-align: center;
    font-size: 1.125rem;
    line-height: 1.75rem;
    font-weight: 600;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
  }

  button {
    flex: 1;
    padding-block: 0.75rem;
    border-radius: 6px;
    font-weight: 600;
    transition: background-color 150ms;
  }

  .cancel {
    background: var(--color-mist-700);
  }

  .cancel:active {
    background: var(--color-mist-600);
  }

  .confirm {
    background: var(--color-danger);
  }

  .confirm:active {
    background: var(--color-danger-active);
  }
</style>
