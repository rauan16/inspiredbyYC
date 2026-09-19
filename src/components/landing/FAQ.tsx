import { ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import { LandingSectionHeading } from "./LandingSectionHeading";

const questions = [
  {
    question: "Что такое ULYS?",
    answer: "ULYS — AI-сервис, который помогает абитуриенту подобрать подходящие университеты и превратить цель поступления в понятный пошаговый маршрут.",
  },
  {
    question: "Как ULYS подбирает университеты?",
    answer: "ULYS учитывает данные профиля: академические результаты, интересы, экзамены, бюджет, предпочтения по странам и образовательные цели.",
  },
  {
    question: "ULYS гарантирует поступление?",
    answer: "Нет. ULYS помогает анализировать варианты и планировать поступление, но не гарантирует решение университета.",
  },
  {
    question: "Что означает ULYS Match?",
    answer: "Это показатель соответствия университета или программы данным и предпочтениям профиля. Это не вероятность поступления.",
  },
  {
    question: "Можно ли изменить свой профиль?",
    answer: "Да. При изменении ключевых параметров рекомендации и маршрут могут быть пересчитаны.",
  },
  {
    question: "Что делает ULIE?",
    answer: "ULIE — AI-помощник внутри ULYS, который помогает понимать рекомендации и работать с персональным маршрутом.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="landing-faq" aria-labelledby="landing-faq-title">
      <div className="landing-container landing-faq__inner">
        <LandingSectionHeading
          align="center"
          title={<span id="landing-faq-title">Частые вопросы</span>}
          description="Коротко о том, как устроен ULYS и что означают его рекомендации."
        />

        <Accordion type="single" collapsible className="landing-accordion">
          {questions.map((item) => (
            <AccordionItem key={item.question} value={item.question} className="landing-accordion__item">
              <AccordionTrigger className="landing-accordion__trigger">
                <span>{item.question}</span>
                <ChevronDown className="landing-accordion__chevron" aria-hidden="true" />
              </AccordionTrigger>
              <AccordionContent className="landing-accordion__content">
                <p>{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
