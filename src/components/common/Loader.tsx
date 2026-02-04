import { Loader2 } from "lucide-react";

interface LoaderProps {
  label?: string;
  fullScreen?: boolean;
}

const Loader = ({ label = "Loading...", fullScreen = false }: LoaderProps) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 py-6">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;


