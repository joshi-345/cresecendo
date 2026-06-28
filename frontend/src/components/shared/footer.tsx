import Link from "next/link";
import { Github, Music2, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#2d2d2d] bg-[#0f0f0f]">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ff6b35] text-white">
                <Music2 className="h-5 w-5" />
              </span>
              <span className="font-display text-xl font-black tracking-[-0.04em] text-[#f0f0f0]">
                Crescendo
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-6 text-[#9ca3af]">
              Music intelligence for artists who want a clearer signal before release day.
            </p>
            <div className="mt-4 flex gap-2">
              <a href="#" className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[#2d2d2d] text-[#9ca3af] transition hover:border-[#ff6b35] hover:text-[#ff6b35]" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[#2d2d2d] text-[#9ca3af] transition hover:border-[#ff6b35] hover:text-[#ff6b35]" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {[
            { title: "Product", links: ["Prediction Lab", "Hidden Gems", "Trend Explorer", "Pricing"] },
            { title: "Creators", links: ["For Artists", "For Producers", "For Labels", "API Access"] },
            { title: "Legal", links: ["Privacy", "Terms", "Security", "Contact"] },
          ].map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-black uppercase tracking-[0.16em] text-[#f0f0f0]">{section.title}</h4>
              <ul className="mt-4 space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="inline-flex min-h-8 items-center text-sm text-[#9ca3af] transition hover:text-[#ff6b35]">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-[#2d2d2d] pt-8 text-center text-sm text-[#6b7280]">
          © {new Date().getFullYear()} Crescendo. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
