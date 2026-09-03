import sqlite3
import os
from datetime import datetime
from typing import Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "ulys.db")


def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS profiles (
            id TEXT PRIMARY KEY,
            email TEXT,
            name TEXT,
            grade TEXT,
            location TEXT,
            bio TEXT,
            interests TEXT DEFAULT '[]',
            goals TEXT DEFAULT '[]',
            portfolio_strength INTEGER DEFAULT 0,
            avatar_initials TEXT,
            academic_info TEXT DEFAULT '{}',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS opportunities (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            organization TEXT NOT NULL,
            category TEXT NOT NULL,
            category_label TEXT,
            deadline TEXT,
            location TEXT,
            format TEXT,
            eligibility TEXT,
            description TEXT,
            requirements TEXT DEFAULT '[]',
            timeline TEXT DEFAULT '[]',
            color TEXT,
            website TEXT,
            recommended INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS saved_opportunities (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            opportunity_id TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
            UNIQUE(user_id, opportunity_id)
        );

        CREATE TABLE IF NOT EXISTS portfolio_items (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            section TEXT NOT NULL,
            title TEXT NOT NULL,
            subtitle TEXT,
            date TEXT,
            description TEXT,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS mentor_messages (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            actions TEXT DEFAULT '[]',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS universities (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            country TEXT NOT NULL,
            location TEXT NOT NULL,
            deadline TEXT,
            requirements TEXT DEFAULT '[]',
            overview TEXT,
            data TEXT DEFAULT '{}',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    conn.commit()
    conn.close()


def seed_opportunities():
    """Seed opportunities if table is empty."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM opportunities")
    if cursor.fetchone()[0] > 0:
        conn.close()
        return

    opportunities = [
        ('kuanysh-forum', 'Kuanysh STEM Forum', 'Kuanysh Foundation', 'forum', 'Форум', '2026-10-02', 'Алматы', 'offline', '9–11 класс, интерес к точным наукам', 'Двухдневный форум для школьников, увлечённых STEM: лекции от инженеров и исследователей, практические лаборатории и питчи собственных проектов перед менторами.', '["Анкета участника", "Короткое эссе о своём STEM-проекте (необязательно)", "Согласие родителей для участников младше 18 лет"]', '[{"label": "Приём заявок", "date": "до 25 сентября"}, {"label": "Отбор участников", "date": "28 сентября"}, {"label": "Форум", "date": "2–3 октября"}]', 'red', 'https://example.org/kuanysh-forum', 1),
        ('nazgul-forum', 'Nazgul Forum', 'Nazgul Youth Initiative', 'forum', 'Форум', '2026-09-20', 'Алматы', 'offline', '10–11 класс', 'Форум молодых лидеров, посвящённый устойчивому развитию и социальному предпринимательству в Центральной Азии.', '["Мотивационное письмо", "Резюме на одну страницу"]', '[{"label": "Приём заявок", "date": "до 15 сентября"}, {"label": "Форум", "date": "20 сентября"}]', 'red', 'https://example.org/nazgul-forum', 0),
        ('aimun-volunteer', 'AIMUN Volunteer Programme', 'Almaty International MUN', 'volunteering', 'Волонтёрство', '2026-09-30', 'Алматы', 'hybrid', 'Любой класс, английский язык от Intermediate', 'Волонтёрская программа модели ООН: логистика, работа с делегатами, помощь секретариату. Официальный сертификат участника по итогам конференции.', '["Анкета волонтёра", "Собеседование (15 минут)"]', '[{"label": "Приём заявок", "date": "до 30 сентября"}, {"label": "Собеседования", "date": "1–3 октября"}, {"label": "Конференция", "date": "12:00–14:00, 19–20 октября"}]', 'yellow', 'https://example.org/aimun', 1),
        ('ictj-olympiad', 'ICTJ Olympiad', 'International Committee for Talented Youth', 'olympiad', 'Физ-Мат Олимпиада', '2026-10-14', 'Онлайн', 'online', '8–11 класс', 'Международная олимпиада по физике и математике в два тура: отборочный онлайн-тур и финал с сертификатом международного образца.', '["Регистрация на платформе", "Отборочный тур (2 часа)"]', '[{"label": "Отборочный тур", "date": "14 октября, 12:00–14:00"}, {"label": "Финал", "date": "9 ноября"}]', 'blue', 'https://example.org/ictj', 0),
        ('almaty-fest', 'Almaty Fest Volunteering', 'Almaty City Events', 'volunteering', 'Волонтёрство', '2026-09-10', 'Алматы', 'offline', '14+ лет', 'Волонтёрская команда городского фестиваля: навигация гостей, помощь на сценах и работа с инвентарём. Отличная возможность получить первый опыт волонтёрства.', '["Анкета", "Инструктаж перед мероприятием"]', '[{"label": "Приём заявок", "date": "до 10 сентября"}, {"label": "Фестиваль", "date": "6:00–10:00, 20 сентября"}]', 'blue', 'https://example.org/almaty-fest', 0),
        ('be-together', 'Be Together', 'Together Kazakhstan', 'volunteering', 'Волонтёрство', '2026-09-25', 'Алматы', 'offline', 'Любой класс', 'Регулярная волонтёрская программа помощи детским домам: образовательные мастер-классы и совместные активности раз в две недели.', '["Анкета", "Собеседование с координатором"]', '[{"label": "Набор волонтёров", "date": "до 25 сентября"}, {"label": "Первая смена", "date": "8:00–10:00, 27 сентября"}]', 'red', 'https://example.org/be-together', 0),
        ('formula-buildathon', 'Формула Buildathon', 'QazTech Youth', 'hackathon', 'Хакатон', '2026-10-05', 'Алматы', 'offline', '9–11 класс, базовые навыки программирования', '48-часовой хакатон для школьных команд: построить прототип продукта, решающего локальную городскую проблему. Менторы из индустрии и призовой фонд для трёх лучших команд.', '["Команда из 2–4 человек", "Заявка с идеей проекта"]', '[{"label": "Регистрация команд", "date": "до 5 октября"}, {"label": "Хакатон", "date": "17–19 октября"}]', 'violet', 'https://example.org/formula-buildathon', 1),
        ('silkroad-research', 'Silk Road Research Fellowship', 'Central Asia Studies Institute', 'research', 'Исследование', '2026-11-01', 'Онлайн', 'online', '10–11 класс, интерес к истории и социальным наукам', 'Восьминедельная исследовательская стажировка под руководством университетского научного руководителя. Итог — короткая исследовательская работа, которую можно включить в портфолио.', '["Мотивационное письмо", "Пример письменной работы"]', '[{"label": "Приём заявок", "date": "до 1 ноября"}, {"label": "Начало программы", "date": "17 ноября"}]', 'yellow', 'https://example.org/silkroad-fellowship', 0),
        ('greenfuture-internship', 'GreenFuture Internship', 'EcoVision Kazakhstan', 'internship', 'Стажировка', '2026-09-18', 'Алматы', 'hybrid', '10–11 класс', 'Оплачиваемая стажировка в отделе устойчивого развития: сбор данных по качеству воздуха и участие в подготовке городского экологического отчёта.', '["Резюме", "Короткое собеседование"]', '[{"label": "Приём заявок", "date": "до 18 сентября"}, {"label": "Стажировка", "date": "5 недель, с 1 октября"}]', 'blue', 'https://example.org/greenfuture', 0),
        ('national-merit-scholarship', 'National Merit Scholarship', 'Bilim Foundation', 'scholarship', 'Стипендия', '2026-12-01', 'По всему Казахстану', 'online', '11 класс, средний балл от 4.5', 'Ежегодная стипендия для выпускников с сильной академической историей и активной внеучебной деятельностью, покрывающая часть стоимости обучения в вузе.', '["Транскрипт оценок", "Портфолио внеучебной деятельности", "Эссе"]', '[{"label": "Приём заявок", "date": "до 1 декабря"}, {"label": "Результаты", "date": "20 января"}]', 'red', 'https://example.org/national-merit', 0),
    ]

    cursor.executemany("""
        INSERT OR IGNORE INTO opportunities (id, title, organization, category, category_label, deadline, location, format, eligibility, description, requirements, timeline, color, website, recommended)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, opportunities)

    conn.commit()
    conn.close()


def seed_universities():
    """Seed universities if table is empty. Full data matches frontend src/data/universities.ts."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM universities")
    if cursor.fetchone()[0] > 0:
        conn.close()
        return

    import json as _json
    from app.data.universities import universities as uni_data

    rows = []
    for u in uni_data:
        rows.append((
            u["id"],
            u["name"],
            u["country"],
            u.get("city") or u.get("location", ""),
            u["deadline"],
            _json.dumps(u["requirements"]),
            u["overview"],
            _json.dumps(u),
        ))

    cursor.executemany("""
        INSERT OR IGNORE INTO universities (id, name, country, location, deadline, requirements, overview, data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, rows)

    conn.commit()
    conn.close()
