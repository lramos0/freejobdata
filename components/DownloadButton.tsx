export function DownloadButton({ href, label = "Download sample CSV" }: { href: string; label?: string }) {
  return (
    <a className="button" href={href} download>
      {label}
    </a>
  )
}
