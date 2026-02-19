export default function Footer() {
  return (
    <footer className="border-t border-arena-border py-6 px-4 flex flex-col md:flex-row items-center justify-between text-xs text-arena-muted max-w-7xl mx-auto gap-4">
      <span>TCG cards tokenized on Monad by AI agents</span>
      <div className="flex gap-4">
        <a href="#" className="hover:text-white transition">Monad Docs</a>
        <a href="#" className="hover:text-white transition">Terms</a>
        <a href="#" className="hover:text-white transition">Privacy</a>
        <a href="#" className="hover:text-white transition">@onMo</a>
      </div>
    </footer>
  )
}
