"use client";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const howItWorks = [
  {
    step: "01",
    title: "Submit your role",
    description:
      "Tell us what you need: role type, required skills, time commitment, location preferences.",
  },
  {
    step: "02",
    title: "We find and vet candidates",
    description:
      "Campus-wide recruiting. Behavioral + technical interviews. You only see final matches.",
  },
  {
    step: "03",
    title: "You interview and decide",
    description:
      "We send you qualified candidates who we think might be a good match and you also talk to them before finalizing.",
  },
  {
    step: "04",
    title: "We check in",
    description: "Post-match support to ensure things run smoothly.",
  },
];

const whyUs = [
  {
    title: "Reach you can't get elsewhere",
    description:
      "We're Columbia-embedded. Students come to us, not job boards. You access talent that wouldn't find you otherwise.",
  },
  {
    title: "Pre-screened pipeline",
    description:
      "Last cohort: 120 applications → 40 interviews → 20 accepted. We filter hard so you don't have to.",
  },
  {
    title: "Zero recruiting overhead",
    description:
      "No posting. No sorting applications. No scheduling chaos. We handle it.",
  },
  {
    title: "Quality at any stage",
    description:
      "Pre-seed or Series A, our students punch above what you'd normally access. Selectivity works in your favor.",
  },
];

const fellowProfiles = [
  {
    category: "Professional experience",
    examples: "Ex-NASA, ex-Deloitte, ex-Google",
  },
  {
    category: "Competition winners",
    examples:
      "Regeneron Scholars, International Math Olympiad finalists, HackMIT, DevFest, national-level hackathons",
  },
  {
    category: "Proven builders",
    examples:
      "Grew social accounts to 200k+ followers, generated millions in UGC views, collaborated with Hollywood composers",
  },
];

const faqs = [
  {
    question: "What stage startups do you work with?",
    answer:
      "Pre-seed to Series A and beyond. NYC-based or remote. Any sector.",
  },
  {
    question: "Do we have to pay Fellows?",
    answer:
      "Compensation depends on you—stipend, hourly, equity, or unpaid. We clarify this before matching.",
  },
  {
    question: "How long do Fellows work with us?",
    answer:
      "Minimum 8 weeks, anywhere between 5-25 hrs/week. Many continue longer if both sides agree.",
  },
  {
    question: "What if we don't like the match?",
    answer:
      "We check in regularly. If it's not working, we'll help course-correct or find alternatives.",
  },
  {
    question: "How quickly can we get matched?",
    answer:
      "Typically 2-3 weeks from submission to interviews, depending on cohort timing.",
  },
];

export function ForStartupsSection() {
  return (
    <section
      id="for-startups"
      className="py-24 md:py-32 bg-muted/30 border-t border-border"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-16">
          <p className="text-primary font-medium text-sm tracking-widest uppercase mb-4">
            For Startups
          </p>
          <h2 className="text-3xl md:text-4xl font-serif-display text-foreground mb-4">
            Find your next great hire
          </h2>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            Access pre-vetted Columbia talent ready to make an impact at your
            startup.
          </p>
        </div>

        {/* How It Works */}
        <div className="mb-24">
          <h3 className="text-lg font-medium text-foreground mb-10">
            How It Works
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item) => (
              <div key={item.step} className="relative">
                <p className="text-5xl font-serif text-primary/30 mb-4">
                  {item.step}
                </p>
                <h4 className="font-medium text-foreground mb-3">
                  {item.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Why Us */}
        <div className="mb-24">
          <h3 className="text-lg font-medium text-foreground mb-10">Why Us</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {whyUs.map((item) => (
              <div key={item.title} className="pl-6 border-l-2 border-primary">
                <h4 className="font-medium text-foreground mb-2">
                  {item.title}
                </h4>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What Our Fellows Look Like */}
        <div className="mb-24">
          <h3 className="text-lg font-medium text-foreground mb-10">
            What Our Fellows Look Like
          </h3>
          <div className="space-y-6 mb-8">
            {fellowProfiles.map((profile) => (
              <div
                key={profile.category}
                className="flex flex-col md:flex-row md:items-start gap-2 md:gap-6"
              >
                <span className="font-medium text-foreground min-w-[200px]">
                  {profile.category}
                </span>
                <span className="text-muted-foreground">{profile.examples}</span>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground italic">
            Technical and non-technical. Ready for meaningful work.
          </p>
        </div>

        {/* FAQs */}
        <div className="mb-12">
          <h3 className="text-lg font-medium text-foreground mb-10">FAQs</h3>
          <Accordion type="single" collapsible className="max-w-2xl font-sans">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border">
                <AccordionTrigger className="text-left text-foreground hover:no-underline py-5 font-sans">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 font-sans">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <Button size="lg" className="font-medium" asChild>
          <Link href="/register?type=startup">
            Submit Your Startup
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
