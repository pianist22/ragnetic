// // components/Navbar.jsx
// "use client";

// import Link from "next/link";

// export default function Navbar() {
//   return (
//     <header className="sticky top-0 z-40 w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
//       <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
//         <Link href="/" className="text-lg font-semibold tracking-tight">
//           RAGnetic
//         </Link>
//         <nav className="ml-auto flex items-center gap-4">
//           <Link className="text-sm text-muted-foreground hover:text-foreground transition-colors" href="/">
//             Home
//           </Link>
//           <Link className="text-sm text-muted-foreground hover:text-foreground transition-colors" href="/#how-it-works">
//             How it works
//           </Link>
//         </nav>
//       </div>
//     </header>
//   );
// }

// components/Navbar.jsx
"use client";

import Link from "next/link";
import ModeToggle from "@/components/mode-toggle";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center px-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-base sm:text-lg font-semibold tracking-tight">
          <span className="inline-block bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-emerald-400 bg-clip-text text-transparent">
            RAGnetic
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="ml-auto hidden sm:flex items-center gap-4">
          <Link
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            href="/#how-it-works"
          >
            How it works
          </Link>
          <ModeToggle />
        </nav>

        {/* Mobile menu */}
        <div className="ml-auto sm:hidden flex items-center gap-2">
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Open menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background hover:bg-muted"
              >
                <Menu className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem asChild>
                <Link href="/#how-it-works">How it works</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/">Home</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
