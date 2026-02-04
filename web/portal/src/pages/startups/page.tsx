import { Header } from "@/components/header";
import { ForStartupsSection } from "@/components/sections/for-startups";
import { Footer } from "@/components/footer";

export default function StartupsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <ForStartupsSection />
      </main>
      <Footer />
    </div>
  );
}
