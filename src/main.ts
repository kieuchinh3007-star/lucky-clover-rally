import './styles/main.css'
/** Entry: the boot markup is static in index.html; three.js and the game load as a separate chunk. */
const bar = document.querySelector<HTMLElement>('[data-boot-bar]')
const text = document.querySelector<HTMLElement>('[data-boot-text]')
const retry = document.querySelector<HTMLButtonElement>('[data-boot-retry]')
const progress = (p: number) => {
  if (bar) bar.style.width = `${Math.round(p * 100)}%`
}
async function boot(): Promise<void> {
  progress(0.08)
  const [{ startGame }] = await Promise.all([import('./game/bootstrap'), document.fonts?.ready])
  progress(0.3)
  await startGame(progress)
  document.getElementById('boot')?.remove()
}
boot().catch(err => {
  console.error(err)
  document.getElementById('boot')?.classList.add('failed')
  if (text) text.textContent = `Lucky Clover Rally failed to start: ${String((err as Error)?.message ?? err)}`
  if (retry) {
    retry.hidden = false
    retry.onclick = () => window.location.reload()
  }
})
