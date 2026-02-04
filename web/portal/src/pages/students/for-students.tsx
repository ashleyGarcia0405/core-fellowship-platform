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
    title: "Apply once",
    description:
      "One application. Tell us your skills, interests, what you want to learn.",
  },
  {
    step: "02",
    title: "We interview strong candidates",
    description:
      "Behavioral + technical (when relevant). Last cohort: 120 apps → 40 interviews → 20 accepted.",
  },
  {
    step: "03",
    title: "We match you to a startup",
    description:
      "Based on fit. Pre-seed to Series A. Tech, consumer, fintech, hardtech, health. NYC or remote.",
  },
  {
    step: "04",
    title: "You do meaningful work",
    description: "5-25 hrs/week, 8 weeks minimum. Projects with impact.",
  },
];

const whyUs = [
  {
    title: "No job board grind",
    description:
      "Apply once. We find opportunities you'd never discover on your own.",
  },
  {
    title: "Vetted on both sides",
    description:
      "We screen students. We screen startups. Quality matches, not random placements.",
  },
  {
    title: "Work that matters",
    description:
      "Work directly with founders. Ship features. Talk to customers. Own outcomes.",
  },
  {
    title: "Built for learning",
    description:
      "Test if you like startups. Build specific skills. Get mentorship from people actually doing it.",
  },
  {
    title: "Flexible commitment",
    description:
      "8 weeks minimum. Many Fellows stay longer—some for over a year.",
  },
  {
    title: "Graduating seniors especially welcome",
    description:
      "Many startups are looking for full-time conversion potential.",
  },
];

const workTypes = [
  "Product development",
  "Marketing and growth strategy",
  "Business operations",
  "Software engineering",
  "UI/UX design and research",
  "Machine learning",
  "Hardware engineering",
  "Customer research",
  "Go-to-market experiments",
];

const faqs = [
  {
    question: "Do I need startup experience?",
    answer:
      "No. Most Fellows don't. We're looking for capability and genuine interest.",
  },
  {
    question: "Do I need to be technical?",
    answer:
      "Not necessarily. We match technical and non-technical students to appropriate roles.",
  },
  {
    question: "How selective is this?",
    answer:
      "Depends on every cohort. Last cohort: ~15% acceptance rate. We encourage everyone to apply as everyone is unique and you might have a higher chance of a unique match for your profile.",
  },
  {
    question: "Will I get paid?",
    answer:
      "Depends on the startup. Some pay, some don't. We clarify before matching. If a startup doesn't provide compensation, you can apply for external support.",
  },
  {
    question: "What if I don't know what I want to do?",
    answer:
      "Tell us in the application. We'll match you to a startup where you can explore.",
  },
  {
    question: "Can I work remotely?",
    answer:
      "Yes, if the startup supports it. We match based on mutual preferences.",
  },
  {
    question: "What happens after 8 weeks?",
    answer:
      "You can keep working if both sides want to. Past Fellows have stayed 2-14 months, with some converting to full-time roles.",
  },
  {
    question: "I'm a graduating senior—can I apply?",
    answer:
      "Absolutely. Many startups are specifically looking for full-time conversion potential.",
  },
];

export function ForStudentsSection() {
  return (
    <section id="for-students" className="py-24 md:py-32 border-t border-border">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-16">
          <p className="text-primary font-medium text-sm tracking-widest uppercase mb-4">
            For Students
          </p>
          <h2 className="text-3xl md:text-4xl font-serif-display text-foreground mb-4">
            Work at startups. Skip the applications.
          </h2>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            Get matched to a startup where you&apos;ll do real work that
            matters.
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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

        {/* What You Could Be Doing */}
        <div className="mb-24">
          <h3 className="text-lg font-medium text-foreground mb-10">
            What You Could Be Doing
          </h3>
          <div className="flex flex-wrap gap-3 mb-6">
            {workTypes.map((type) => (
              <span
                key={type}
                className="px-4 py-2 rounded-full border border-primary text-foreground text-sm"
              >
                {type}
              </span>
            ))}
          </div>
          <p className="text-muted-foreground italic">
            You&apos;ll wear multiple hats. That&apos;s the point.
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
          <Link href="/register?type=student">
            Apply Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
