import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { About } from "@/components/landing/About";
import { CtaBanner } from "@/components/landing/CtaBanner";
import { Footer } from "@/components/landing/Footer";
import { publicFileExists } from "@/lib/assets";

const FLYER_PATH = "flyer/jaj-oficial.png";

export default function Home() {
  const hasFlyer = publicFileExists(FLYER_PATH);

  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero flyerSrc={hasFlyer ? `/${FLYER_PATH}` : null} />
        <About />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
