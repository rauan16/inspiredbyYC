"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { faqItems } from "@/data/student";
import { SectionHeading } from "./SectionHeading";

export function FAQ() {
  return (
    <section id="faq" className="py-20 md:py-24">
      <div className="container-ulys">
        <SectionHeading title="Частые вопросы" />

        <Accordion.Root type="single" collapsible className="mt-10 divide-y divide-line border-t border-line">
          {faqItems.map((item, i) => (
            <Accordion.Item key={i} value={`item-${i}`}>
              <Accordion.Header>
                <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 py-5 text-left transition-colors duration-200 hover:text-red active:text-red">
                  <span className="font-display text-[15px] font-medium">{item.question}</span>
                  <ChevronDown className="h-4.5 w-4.5 shrink-0 text-ink-soft transition-transform duration-300 ease-out group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="overflow-hidden pb-0 text-[14px] leading-relaxed text-ink-soft data-[state=open]:pb-5 data-[state=open]:animate-[accordion-down_280ms_ease-out] data-[state=closed]:animate-[accordion-up_220ms_ease-out]">
                {item.answer}
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}
