import { Header } from "@/components/header";
import { ForStudentsSection } from "@/components/sections/for-students";
import { Footer } from "@/components/footer";

export default function StudentsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <ForStudentsSection />
      </main>
      <Footer />
    </div>
  );
}
