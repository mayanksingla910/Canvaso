"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoveLeft, Home} from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
      
      <div className="absolute inset-0 z-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [bg-size:24px_24px]"></div>

      <div className="container relative z-10 flex flex-col items-center text-center">
        <div className="mb-8 flex flex-col items-center">
          <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Error 404
          </span>
          <h1 className="mt-2 text-7xl font-extrabold tracking-tight sm:text-9xl text-primary">
            Lost?
          </h1>
          <p className="mt-4 max-w-lg text-lg text-muted-foreground">
            The page you&#39;re looking for has vanished into the digital void. Let&#39;s get you back on track.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button
            variant="link"
            className="text-muted-foreground hover:text-primary transition-colors gap-2"
            onClick={() => window.history.back()}
          >
            <MoveLeft className="h-4 w-4" />
            Go back to previous page
          </Button>

          <Button asChild variant="default" size="lg" className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>

        <div className="mt-12"></div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent"></div>
    </div>
  );
}
