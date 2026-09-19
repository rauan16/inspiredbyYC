import { MessageCircle, Sparkles } from "lucide-react";
import { LandingReveal } from "./LandingReveal";

const messages = [
  {
    role: "user",
    text: "Почему этот университет подходит мне?",
  },
  {
    role: "ulie",
    text: "Его программа соответствует выбранному тобой направлению, языковые требования совпадают с твоим профилем, а указанная стоимость находится в пределах выбранного бюджета.",
  },
  {
    role: "user",
    text: "Что мне улучшить сейчас?",
  },
  {
    role: "ulie",
    text: "В твоём плане следующий приоритет — подготовка к SAT и усиление академического проекта. Я могу помочь разбить это на конкретные шаги.",
  },
];

export function UlieSection() {
  return (
    <section className="landing-ulie" aria-labelledby="landing-ulie-title">
      <div className="landing-container landing-split">
        <LandingReveal className="landing-ulie__copy">
          <div className="landing-badge">
            <Sparkles className="landing-badge__icon" aria-hidden="true" />
            <span>ULIE внутри маршрута</span>
          </div>
          <h2 id="landing-ulie-title" className="landing-section-title">
            ULIE знает
            <br />
            <span className="landing-text-accent">твой маршрут</span>
          </h2>
          <p className="landing-body-copy">
            Спроси, почему тебе рекомендован университет, что улучшить в профиле или
            какой шаг сделать следующим. ULIE помогает не вместо тебя, а в контексте
            твоего профиля и плана.
          </p>
        </LandingReveal>

        <div className="landing-ulie__trust landing-reveal is-visible" aria-label="Принцип работы ULIE">
          <Sparkles className="landing-ulie__trust-icon" aria-hidden="true" />
          <p>Объяснения привязаны к твоим целям,<br />ограничениям и текущему шагу</p>
        </div>

        <LandingReveal className="landing-chat" aria-label="Пример диалога с ULIE">
          <div className="landing-chat__header">
            <div className="landing-chat__identity">
              <span className="landing-chat__avatar" aria-hidden="true">
                <Sparkles />
              </span>
              <div>
                <strong>ULIE</strong>
                <span>AI-помощник ULYS</span>
              </div>
            </div>
            <span className="landing-chat__status"><i aria-hidden="true" />Онлайн</span>
          </div>

          <div className="landing-chat__messages">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={message.role === "user" ? "landing-chat-message landing-chat-message--user" : "landing-chat-message landing-chat-message--ulie"}
              >
                {message.role === "ulie" && (
                  <span className="landing-chat-message__avatar" aria-hidden="true">
                    <MessageCircle />
                  </span>
                )}
                <p>{message.text}</p>
              </div>
            ))}
          </div>
        </LandingReveal>
      </div>
    </section>
  );
}
