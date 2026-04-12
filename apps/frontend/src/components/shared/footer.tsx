import Link from "next/link";

const footerLinks = [
    { href: "/", label: "Home" },
    { href: "/problems", label: "Problems" },
    { href: "/about", label: "About" },
];

export function Footer() {
    return (
        <footer
            id="footer"
            className="border-t border-white/10"
            aria-label="Site footer"
        >
            <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-5 text-sm text-zinc-400 sm:px-8">
                <p>The Auto Judge</p>
                <nav className="flex items-center gap-4" aria-label="Footer links">
                    {footerLinks.map((link) => (
                        <Link
                            key={link.href + link.label}
                            href={link.href}
                            className="transition-colors hover:text-zinc-200"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </footer>
    );
}
