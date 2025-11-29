import Link from "next/link";
import { Sparkles } from "lucide-react";

export function SiteBanner() {
  return (
    <div className="relative top-0 bg-[#ff6154] text-background py-3 md:py-0">
      <div className="container flex flex-col items-center justify-center gap-4 md:h-12 md:flex-row">
        <Link
          href="https://www.producthunt.com/posts/chat-collect?utm_source=banner-featured&utm_medium=banner&utm_souce=banner-chat&#0045;collect"
          target="_blank"
          className="inline-flex items-center gap-2 text-center text-sm leading-loose text-muted-background"
        >
          <Sparkles className="h-4 w-4" />
          <span className="font-bold">We&apos;re live on ProductHunt!</span>
          <span>Come check us out and leave a review!</span>
          <Sparkles className="h-4 w-4" />
        </Link>
      </div>
      <hr className="absolute bottom-0 m-0 h-px w-full bg-neutral-200/30" />
    </div>
  );
}
