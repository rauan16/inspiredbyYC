import { AlertCircle, Check, MapPin } from "lucide-react";
import { LandingSectionHeading } from "./LandingSectionHeading";

const matches = [
  {
    initials: "NU",
    name: "Nazarbayev University",
    location: "Астана, Казахстан",
    program: "Computer Science",
    score: "86",
    tag: "Сильное совпадение",
    tagTone: "landing-match-tag--strong",
    reasons: [
      "Направление соответствует твоим интересам",
      "Языковые требования совпадают",
      "Стоимость входит в твой бюджет",
    ],
    warning: "Нужно уточнить требования к портфолио",
  },
  {
    initials: "UCL",
    name: "University College London",
    location: "Лондон, Великобритания",
    program: "Engineering",
    score: "74",
    tag: "Амбициозный вариант",
    tagTone: "landing-match-tag--ambitious",
    reasons: [
      "Сильная программа по выбранному направлению",
      "Есть варианты на английском языке",
      "Можно усилить профиль проектами",
    ],
    warning: "Потребуется более сильный академический результат",
  },
  {
    initials: "KBTU",
    name: "KBTU",
    location: "Алматы, Казахстан",
    program: "Information Systems",
    score: "91",
    tag: "Альтернатива",
    tagTone: "landing-match-tag--alternative",
    reasons: [
      "Программа близка к твоим интересам",
      "Подходит по языку и формату обучения",
      "Хорошо вписывается в бюджет",
    ],
    warning: "Проверь актуальные вступительные требования",
  },
];

export function UniversityMatchesDemo() {
  return (
    <section id="matches" className="landing-matches" aria-labelledby="landing-matches-title">
      <div className="landing-container">
        <LandingSectionHeading
          className="landing-matches__heading"
          title={<span id="landing-matches-title">Не просто университеты.<br /><span className="landing-text-accent">Варианты, которые подходят тебе.</span></span>}
          description="ULYS учитывает академический профиль, бюджет, интересы, язык обучения и образовательные цели."
        />

        <div className="landing-match-grid">
          {matches.map((match) => (
            <article key={match.name} className="landing-match-card landing-reveal">
              <div className="landing-match-card__top">
                <div className="landing-match-card__identity">
                  <span className="landing-match-card__initials">{match.initials}</span>
                  <div>
                    <h3>{match.name}</h3>
                    <p className="landing-match-card__location">
                      <MapPin aria-hidden="true" />
                      {match.location}
                    </p>
                  </div>
                </div>
                <div className="landing-match-score" aria-label={`ULYS Match: ${match.score} процентов`}>
                  <span>{match.score}%</span>
                  <small>ULYS Match</small>
                </div>
              </div>

              <div className="landing-match-card__program">
                <span>Программа</span>
                <strong>{match.program}</strong>
              </div>

              <span className={`landing-match-tag ${match.tagTone}`}>{match.tag}</span>

              <div className="landing-match-card__reasons">
                <p>Почему подходит:</p>
                <ul>
                  {match.reasons.map((reason) => (
                    <li key={reason}>
                      <Check aria-hidden="true" />
                      {reason}
                    </li>
                  ))}
                  <li className="landing-match-card__warning">
                    <AlertCircle aria-hidden="true" />
                    {match.warning}
                  </li>
                </ul>
              </div>
            </article>
          ))}
        </div>

        <p className="landing-match-caption">
          ULYS Match показывает соответствие варианта твоему профилю, а не вероятность поступления.
        </p>
      </div>
    </section>
  );
}
