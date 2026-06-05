"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { NationsGrid } from "@/components/nations-grid";
import { TriondaBackground } from "@/components/trionda-background";
import { MatchFixtures } from "@/components/match-fixtures";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Home() {
  const [activeTab, setActiveTab] = useState("squads");
  const [selectedNationId, setSelectedNationId] = useState<string | null>(null);

  useEffect(() => {
    const handleNationSelection = (event: CustomEvent) => {
      setSelectedNationId(event.detail);
      setActiveTab("squads");
    };

    window.addEventListener("nationSelected", handleNationSelection as EventListener);

    return () => {
      window.removeEventListener("nationSelected", handleNationSelection as EventListener);
    };
  }, []);

  return (
    <main className="min-h-screen relative">
      <TriondaBackground />
      <div className="relative z-10">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mx-auto mb-6">
              <TabsTrigger value="squads">Squads</TabsTrigger>
              <TabsTrigger value="fixtures">Match Fixtures</TabsTrigger>
            </TabsList>
            <TabsContent value="squads" className="mt-0">
              <NationsGrid initialSelectedNationId={selectedNationId} />
            </TabsContent>
            <TabsContent value="fixtures" className="mt-0">
              <MatchFixtures />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
