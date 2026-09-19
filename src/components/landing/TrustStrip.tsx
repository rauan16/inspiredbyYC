import { ArrowUpRight, Globe2, MapPin } from "lucide-react";

const universities = [
  {
    name: "Stanford University",
    fullName: "Stanford University",
    monogram: "S",
    location: "United States · California",
  },
  {
    name: "University of Melbourne",
    fullName: "University of Melbourne",
    monogram: "M",
    location: "Australia · Melbourne",
  },
  {
    name: "NUS",
    fullName: "National University of Singapore",
    monogram: "N",
    location: "Singapore",
  },
  {
    name: "University of Tokyo",
    fullName: "University of Tokyo",
    monogram: "T",
    location: "Japan · Tokyo",
  },
  {
    name: "UCL",
    fullName: "University College London",
    monogram: "U",
    location: "United Kingdom · London",
  },
  {
    name: "Nazarbayev University",
    fullName: "Nazarbayev University",
    monogram: "NU",
    location: "Kazakhstan · Astana",
  },
  {
    name: "University of Toronto",
    fullName: "University of Toronto",
    monogram: "T",
    location: "Canada · Toronto",
  },
  {
    name: "ETH Zürich",
    fullName: "ETH Zürich",
    monogram: "E",
    location: "Switzerland · Zürich",
  },
  {
    name: "University of Manchester",
    fullName: "University of Manchester",
    monogram: "M",
    location: "United Kingdom · Manchester",
  },
  {
    name: "KAIST",
    fullName: "KAIST",
    monogram: "K",
    location: "South Korea · Daejeon",
  },
  {
    name: "University of Amsterdam",
    fullName: "University of Amsterdam",
    monogram: "A",
    location: "Netherlands · Amsterdam",
  },
  {
    name: "University of Edinburgh",
    fullName: "University of Edinburgh",
    monogram: "E",
    location: "United Kingdom · Edinburgh",
  },
];

function UniversityCard({ university }: { university: (typeof universities)[number] }) {
  return (
    <article
      className="landing-university-card"
      tabIndex={0}
      aria-label={`${university.fullName}, ${university.location}. Иллюстративный пример.`}
    >
      <span className="landing-university-card__monogram" aria-hidden="true">
        {university.monogram}
      </span>
      <span className="landing-university-card__name">{university.name}</span>
      <span className="landing-university-popover" role="tooltip">
        <strong>{university.fullName}</strong>
        <span className="landing-university-popover__location">
          <MapPin aria-hidden="true" />
          {university.location}
        </span>
        <span className="landing-university-popover__action">
          Explore programs <ArrowUpRight aria-hidden="true" />
        </span>
        <span className="landing-university-popover__note">Illustrative university entry</span>
      </span>
    </article>
  );
}

export function TrustStrip() {
  return (
    <section className="landing-trust" aria-labelledby="landing-trust-title">
      <div className="landing-container">
        <div className="landing-trust__heading landing-reveal">
          <span className="landing-trust__icon" aria-hidden="true">
            <Globe2 />
          </span>
          <div>
            <p id="landing-trust-title" className="landing-trust__title">Исследуй университеты по всему миру</p>
            <p className="landing-trust__caption">Сравнивай программы и находи варианты, которые соответствуют твоим целям.</p>
          </div>
        </div>
        <div className="landing-trust__viewport" aria-label="Иллюстративные примеры университетов для сравнения">
          <div className="landing-trust__track">
            <div className="landing-trust__group">
              {universities.map((university) => <UniversityCard key={`${university.name}-a`} university={university} />)}
            </div>
            <div className="landing-trust__group" aria-hidden="true">
              {universities.map((university) => <UniversityCard key={`${university.name}-b`} university={university} />)}
            </div>
          </div>
        </div>
        <p className="landing-trust__disclaimer">Примеры доступны для исследования и сравнения · не партнёры и не эндорсмент ULYS</p>
      </div>
    </section>
  );
}
