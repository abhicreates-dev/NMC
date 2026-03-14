import { useEffect, useRef } from "react";

const BOLT_URL = import.meta.env.VITE_BOLT_URL ?? "http://localhost:5174";

export function ProjectDev() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // keep iframe focused so keyboard shortcuts work inside it
    iframeRef.current?.focus();
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      <iframe
        ref={iframeRef}
        src={BOLT_URL}
        className="flex-1 w-full border-0"
        title="bolt.diy — Project Dev"
        allow="clipboard-read; clipboard-write; microphone; camera"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-storage-access-by-user-activation"
      />
    </div>
  );
}
