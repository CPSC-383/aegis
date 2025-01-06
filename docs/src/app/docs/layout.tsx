import Link from "next/link";
import { ReactNode } from "react";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <header>
        <nav>
          <Link href="/docs">Docs Home</Link>
        </nav>
      </header>

      <section>{children}</section>
    </div>
  );
}
