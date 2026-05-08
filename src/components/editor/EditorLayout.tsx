import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Eye, Edit3 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface EditorLayoutProps {
  panel: React.ReactNode;
  preview: React.ReactNode;
}

export function EditorLayout({ panel, preview }: EditorLayoutProps) {
  const isMobile = useIsMobile();
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");

  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as "editor" | "preview")} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>
          <TabsContent value="editor" className="flex-1 overflow-auto mt-0">
            {panel}
          </TabsContent>
          <TabsContent value="preview" className="flex-1 overflow-auto mt-0 flex justify-center">
            {preview}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="flex gap-8 h-full">
      {/* Left Panel - Editor */}
      <div className="flex-1 overflow-auto pr-4">
        {panel}
      </div>

      {/* Right Panel - Preview */}
      <div className="w-[380px] flex-shrink-0 flex justify-center">
        {preview}
      </div>
    </div>
  );
}
