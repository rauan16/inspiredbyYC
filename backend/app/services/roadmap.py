import hashlib
import re
from datetime import date, timedelta
from typing import Optional

from app.schemas.roadmap import RoadmapTask, TaskCategory, TaskPriority, TaskStatus, RoadmapResponse, NextBestAction
from app.services.matching import (
    StudentMatchingProfile,
    UniversityMatch,
    normalize_student_profile,
    match_student_to_universities,
)
from app.data.universities import universities as uni_data


def _deterministic_task_id(title: str, category: TaskCategory) -> str:
    """Generate a deterministic task ID based on title and category."""
    key = f"{title}:{category.value}"
    return hashlib.md5(key.encode()).hexdigest()[:8]


def compute_profile_completeness(profile: dict, portfolio: list[dict]) -> int:
    academic = profile.get("academicInfo") or {}
    score = 0
    if academic.get("gpa"):
        score += 15
    if academic.get("sat") or academic.get("act"):
        score += 15
    if academic.get("ielts") or academic.get("toefl"):
        score += 15
    if academic.get("intendedMajor"):
        score += 10
    if academic.get("preferredCountries"):
        score += 10
    if academic.get("budgetMax"):
        score += 5
    if portfolio:
        score += min(len(portfolio) * 3, 30)
    return min(score, 100)


def get_student_profile(profile: dict, portfolio: list[dict]) -> StudentMatchingProfile:
    return normalize_student_profile(profile, portfolio)


def get_university_matches(student: StudentMatchingProfile, limit: int = 10) -> list[UniversityMatch]:
    return match_student_to_universities(student, uni_data, limit)


def analyze_gaps(student: StudentMatchingProfile, matches: list[UniversityMatch]) -> dict:
    all_gaps = []
    all_next_actions = []
    gap_frequency = {}
    
    for match in matches:
        for gap in match.gaps:
            all_gaps.append(gap)
            gap_frequency[gap] = gap_frequency.get(gap, 0) + 1
        for action in match.next_actions:
            all_next_actions.append(action)
    
    return {
        "gaps": list(set(all_gaps)),
        "gap_frequency": gap_frequency,
        "next_actions": list(set(all_next_actions)),
    }


def generate_academic_tasks(student: StudentMatchingProfile, matches: list[UniversityMatch], gap_analysis: dict) -> list[RoadmapTask]:
    tasks = []
    gap_freq = gap_analysis["gap_frequency"]
    
    sat_required = any(
        any(kw in uni.get("satRequirements", "").lower() for kw in ["required", "requir", "1350", "1400", "1450", "1500"])
        and "optional" not in uni.get("satRequirements", "").lower()
        for uni in [next((u for u in uni_data if u["id"] == m.university_id), None) for m in matches] if uni
    )
    
    gpa_required = any(
        any(kw in uni.get("gpaRequirements", "").lower() for kw in ["gpa", "балл", "3.", "4."])
        for uni in [next((u for u in uni_data if u["id"] == m.university_id), None) for m in matches] if uni
    )
    
    lang_required = any(
        any(kw in uni.get("languageRequirements", "").lower() for kw in ["ielts", "toefl", "english", "английский"])
        for uni in [next((u for u in uni_data if u["id"] == m.university_id), None) for m in matches] if uni
    )
    
    if sat_required and not student.sat and not student.act:
        freq = gap_freq.get("SAT/ACT не указан", 0)
        priority = TaskPriority.HIGH if freq >= 3 else TaskPriority.MEDIUM
        tasks.append(RoadmapTask(
            id=_deterministic_task_id("Сдать SAT или ACT", TaskCategory.ACADEMICS),
            title="Сдать SAT или ACT",
            description="Подготовьтесь и сдайте SAT (цель 1350+) или ACT (цель 29+) для компетентности по топовым программам.",
            category=TaskCategory.ACADEMICS,
            priority=priority,
            reason=f"SAT/ACT требуется для {freq} из {len(matches)} рекомендуемых университетов",
            related_university=matches[0].name if matches else None,
        ))
    elif sat_required and student.sat:
        # Check for SAT below target gaps
        sat_gap_keys = [k for k in gap_freq.keys() if k.startswith("SAT ") and "ниже целевого" in k]
        if sat_gap_keys:
            # Get the highest target mentioned
            max_target = 0
            for k in sat_gap_keys:
                match = re.search(r'целевого (\d+)\+', k)
                if match:
                    max_target = max(max_target, int(match.group(1)))
            freq = sum(gap_freq[k] for k in sat_gap_keys)
            tasks.append(RoadmapTask(
                id=_deterministic_task_id("Повысить SAT", TaskCategory.ACADEMICS),
                title="Повысить SAT",
                description=f"Текущий SAT: {student.sat}. Цель: {max_target}+ для топовых программ. План: 2-3 месяца подготовки.",
                category=TaskCategory.ACADEMICS,
                priority=TaskPriority.HIGH,
                reason=f"SAT ниже целевого для {freq} рекомендуемых университетов",
                related_university=matches[0].name if matches else None,
            ))
    
    if gpa_required and not student.gpa:
        freq = gap_freq.get("GPA не указан", 0)
        priority = TaskPriority.HIGH if freq >= 3 else TaskPriority.MEDIUM
        tasks.append(RoadmapTask(
            id=_deterministic_task_id("Добавить GPA в профиль", TaskCategory.ACADEMICS),
            title="Добавить GPA в профиль",
            description="Укажите ваш средний балл (GPA) в академическом профиле. Это критично для оценки шансов.",
            category=TaskCategory.ACADEMICS,
            priority=priority,
            reason=f"GPA не указан, но требуется для {freq} университетов",
            related_university=matches[0].name if matches else None,
        ))
    
    if lang_required and not student.ielts and not student.toefl:
        freq = gap_freq.get("IELTS/TOEFL не указан", 0)
        priority = TaskPriority.HIGH if freq >= 3 else TaskPriority.MEDIUM
        tasks.append(RoadmapTask(
            id=_deterministic_task_id("Сдать IELTS или TOEFL", TaskCategory.LANGUAGE),
            title="Сдать IELTS или TOEFL",
            description="Подготовьтесь к IELTS (цель 6.5-7.0+) или TOEFL (цель 90-100+). Требуется почти всеми международными вузами.",
            category=TaskCategory.LANGUAGE,
            priority=priority,
            reason=f"Английский не подтвержден, но требуется для {freq} университетов",
            related_university=matches[0].name if matches else None,
        ))
    elif lang_required and student.ielts:
        # Check for IELTS below target gaps
        ielts_gap_keys = [k for k in gap_freq.keys() if k.startswith("IELTS ") and "ниже целевого" in k]
        if ielts_gap_keys:
            # Get the highest target mentioned
            max_target = 0.0
            for k in ielts_gap_keys:
                match = re.search(r'целевого ([\d.]+)\+', k)
                if match:
                    max_target = max(max_target, float(match.group(1)))
            freq = sum(gap_freq[k] for k in ielts_gap_keys)
            tasks.append(RoadmapTask(
                id=_deterministic_task_id("Повысить IELTS", TaskCategory.LANGUAGE),
                title="Повысить IELTS",
                description=f"Текущий IELTS: {student.ielts}. Цель: {max_target}+ для топовых программ. План: 1-2 месяца подготовки.",
                category=TaskCategory.LANGUAGE,
                priority=TaskPriority.HIGH,
                reason=f"IELTS ниже целевого для {freq} рекомендуемых университетов",
                related_university=matches[0].name if matches else None,
            ))
    
    return tasks


def generate_application_tasks(student: StudentMatchingProfile, matches: list[UniversityMatch], gap_analysis: dict) -> list[RoadmapTask]:
    tasks = []
    
    if matches:
        top_match = matches[0]
        tasks.append(RoadmapTask(
            id=_deterministic_task_id("Изучить требования топового университета", TaskCategory.UNIVERSITY_RESEARCH),
            title="Изучить требования топового университета",
            description=f"Детально изучите требования {top_match.name} ({top_match.country}): дедлайны, документы, эссе, рекомендательные письма.",
            category=TaskCategory.UNIVERSITY_RESEARCH,
            priority=TaskPriority.HIGH,
            reason=f"Топовый матч: {top_match.name} (score: {top_match.match_score})",
            related_university=top_match.name,
        ))
    
    if len(matches) >= 3:
        tasks.append(RoadmapTask(
            id=_deterministic_task_id("Сравнить 3-5 целевых университетов", TaskCategory.UNIVERSITY_RESEARCH),
            title="Сравнить 3-5 целевых университетов",
            description="Создайте таблицу сравнения: дедлайны, стоимость, гранты, требования к SAT/IELTS/GPA, программы.",
            category=TaskCategory.UNIVERSITY_RESEARCH,
            priority=TaskPriority.MEDIUM,
            reason=f"Найдено {len(matches)} подходящих университетов, нужен выбор",
        ))
    
    tasks.append(RoadmapTask(
        id=_deterministic_task_id("Подготовить пакет документов для подачи", TaskCategory.DOCUMENTS),
        title="Подготовить пакет документов для подачи",
        description="Соберите: транскрипт оценок, сертификаты языков, диплом/аттестат, рекомендательные письма (2-3), мотивационное письмо.",
        category=TaskCategory.DOCUMENTS,
        priority=TaskPriority.HIGH,
        reason="Базовый пакет документов нужен для любого приложения",
    ))
    
    if student.intended_major:
        tasks.append(RoadmapTask(
            id=_deterministic_task_id("Написать мотивационное эссе (Personal Statement)", TaskCategory.ESSAYS),
            title="Написать мотивационное эссе (Personal Statement)",
            description=f"Эссе под {student.intended_major}: покажите страсть к предмету, релевантный опыт, цели. 400-600 слов.",
            category=TaskCategory.ESSAYS,
            priority=TaskPriority.HIGH,
            reason=f"Эссе обязательно для программы {student.intended_major}",
        ))
    
    return tasks


def generate_extracurricular_tasks(student: StudentMatchingProfile, matches: list[UniversityMatch], gap_analysis: dict) -> list[RoadmapTask]:
    tasks = []
    gap_freq = gap_analysis["gap_frequency"]
    
    has_achievements = len(student.achievements) > 0
    has_extracurriculars = len(student.extracurriculars) > 0
    
    if not has_achievements:
        freq = gap_freq.get("Нет достижений в портфолио", 0)
        priority = TaskPriority.HIGH if freq >= 3 else TaskPriority.MEDIUM
        tasks.append(RoadmapTask(
            id=_deterministic_task_id("Добавить достижения в портфолио", TaskCategory.EXTRACURRICULARS),
            title="Добавить достижения в портфолио",
            description="Добавьте олимпиады, конкурсы, сертификаты, награды. Даже локальные достижения усиливают профиль.",
            category=TaskCategory.EXTRACURRICULARS,
            priority=priority,
            reason=f"Нет достижений — слабый профиль для {freq} университетов",
        ))
    
    if not has_extracurriculars:
        freq = gap_freq.get("Нет внеучебных активностей", 0)
        priority = TaskPriority.MEDIUM if freq >= 2 else TaskPriority.LOW
        tasks.append(RoadmapTask(
            id=_deterministic_task_id("Начать внеучебную активность / проект", TaskCategory.EXTRACURRICULARS),
            title="Начать внеучебную активность / проект",
            description="Запустите проект, волонтёрство, стажировку или хобби с демонстрируемым результатом. 3-6 месяцев до подачи.",
            category=TaskCategory.EXTRACURRICULARS,
            priority=priority,
            reason=f"Нет внеучебных активностей для {freq} университетов",
        ))
    elif len(student.extracurriculars) < 3:
        tasks.append(RoadmapTask(
            id=_deterministic_task_id("Расширить профиль внеучебных активностей", TaskCategory.EXTRACURRICULARS),
            title="Расширить профиль внеучебных активностей",
            description=f"Сейчас {len(student.extracurriculars)} активностей. Добавьте 1-2 значимых проекта (лидерство, инициатива, влияние).",
            category=TaskCategory.EXTRACURRICULARS,
            priority=TaskPriority.MEDIUM,
            reason="Профиль может быть сильнее с большим количеством качественных активностей",
        ))
    
    return tasks


def generate_language_tasks(student: StudentMatchingProfile, matches: list[UniversityMatch]) -> list[RoadmapTask]:
    tasks = []
    
    if student.ielts and student.ielts >= 7.0 and student.toefl and student.toefl >= 100:
        return tasks
    
    lang_required = any(
        any(kw in uni.get("languageRequirements", "").lower() for kw in ["ielts", "toefl", "english", "английский"])
        for uni in [next((u for u in uni_data if u["id"] == m.university_id), None) for m in matches] if uni
    )
    
    if not lang_required:
        return tasks
    
    if student.ielts is None and student.toefl is None:
        return tasks
    
    if student.ielts and student.ielts < 7.0:
        target_unis = [m for m in matches if m.match_score >= 70]
        if target_unis:
            tasks.append(RoadmapTask(
                id=_deterministic_task_id("Повысить IELTS до 7.0+", TaskCategory.LANGUAGE),
                title="Повысить IELTS до 7.0+",
                description=f"Текущий: {student.ielts}. Для топ-{len(target_unis)} матчей нужен 7.0+. План: интенсивная подготовка 6-8 недель.",
                category=TaskCategory.LANGUAGE,
                priority=TaskPriority.HIGH,
                reason=f"IELTS {student.ielts} ниже 7.0 для топовых матчей",
                related_university=target_unis[0].name if target_unis else None,
            ))
    
    if student.toefl and student.toefl < 100:
        target_unis = [m for m in matches if m.match_score >= 70]
        if target_unis:
            tasks.append(RoadmapTask(
                id=_deterministic_task_id("Повысить TOEFL до 100+", TaskCategory.LANGUAGE),
                title="Повысить TOEFL до 100+",
                description=f"Текущий: {student.toefl}. Для топ-{len(target_unis)} матчей нужен 100+. План: интенсивная подготовка 6-8 недель.",
                category=TaskCategory.LANGUAGE,
                priority=TaskPriority.HIGH,
                reason=f"TOEFL {student.toefl} ниже 100 для топовых матчей",
                related_university=target_unis[0].name if target_unis else None,
            ))
    
    return tasks


def assign_deadlines(tasks: list[RoadmapTask], student: StudentMatchingProfile) -> list[RoadmapTask]:
    base_date = date.today()
    academic_tasks = [t for t in tasks if t.category in (TaskCategory.ACADEMICS, TaskCategory.LANGUAGE)]
    other_tasks = [t for t in tasks if t.category not in (TaskCategory.ACADEMICS, TaskCategory.LANGUAGE)]
    
    for i, task in enumerate(academic_tasks):
        if task.priority == TaskPriority.HIGH:
            task.target_date = base_date + timedelta(weeks=4 + i * 4)
        elif task.priority == TaskPriority.MEDIUM:
            task.target_date = base_date + timedelta(weeks=8 + i * 4)
        else:
            task.target_date = base_date + timedelta(weeks=12 + i * 4)
    
    for i, task in enumerate(other_tasks):
        if task.priority == TaskPriority.HIGH:
            task.target_date = base_date + timedelta(weeks=2 + i * 2)
        elif task.priority == TaskPriority.MEDIUM:
            task.target_date = base_date + timedelta(weeks=6 + i * 2)
        else:
            task.target_date = base_date + timedelta(weeks=10 + i * 2)
    
    return tasks


def select_next_best_action(tasks: list[RoadmapTask]) -> Optional[NextBestAction]:
    """Select the most important unfinished task as Next Best Action.
    
    Priority order:
    1. Overdue/urgent deadline task (if real deadline exists)
    2. High priority unfinished task
    3. Medium priority unfinished task
    4. Low priority unfinished task
    
    For same priority: prefer nearest real deadline (target_date).
    If no deadline: use stable roadmap order.
    """
    today = date.today()
    unfinished = [t for t in tasks if t.status != TaskStatus.COMPLETED]
    
    if not unfinished:
        return None
    
    # Check for overdue tasks with real deadline
    overdue = [t for t in unfinished if t.deadline and t.deadline < today]
    if overdue:
        overdue.sort(key=lambda t: t.deadline)
        selected = overdue[0]
        return NextBestAction(
            task_id=selected.id,
            title=selected.title,
            category=selected.category,
            priority=selected.priority,
            deadline=selected.deadline,
            target_date=selected.target_date,
            reason=selected.reason,
            completed=False,
        )
    
    # Sort by priority (HIGH first), then by target_date (nearest first), then by original order
    def sort_key(task: RoadmapTask):
        priority_order = {
            TaskPriority.HIGH: 0,
            TaskPriority.MEDIUM: 1,
            TaskPriority.LOW: 2,
        }
        # Use target_date if available, otherwise use a far future date for sorting
        deadline_sort = task.target_date or date(9999, 12, 31)
        return (priority_order.get(task.priority, 3), deadline_sort)
    
    unfinished.sort(key=sort_key)
    selected = unfinished[0]
    
    return NextBestAction(
        task_id=selected.id,
        title=selected.title,
        category=selected.category,
        priority=selected.priority,
        deadline=selected.deadline,
        target_date=selected.target_date,
        reason=selected.reason,
        completed=False,
    )


def generate_roadmap(profile: dict, portfolio: list[dict]) -> RoadmapResponse:
    student = get_student_profile(profile, portfolio)
    matches = get_university_matches(student, limit=10)
    gap_analysis = analyze_gaps(student, matches)
    
    all_tasks = []
    all_tasks.extend(generate_academic_tasks(student, matches, gap_analysis))
    all_tasks.extend(generate_language_tasks(student, matches))
    all_tasks.extend(generate_application_tasks(student, matches, gap_analysis))
    all_tasks.extend(generate_extracurricular_tasks(student, matches, gap_analysis))
    
    all_tasks = assign_deadlines(all_tasks, student)
    
    seen = set()
    unique_tasks = []
    for task in all_tasks:
        key = (task.title, task.category)
        if key not in seen:
            seen.add(key)
            unique_tasks.append(task)
    
    unique_tasks.sort(key=lambda t: (t.priority != TaskPriority.HIGH, t.priority != TaskPriority.MEDIUM, t.category.value))
    
    final_tasks = unique_tasks[:10]
    if len(final_tasks) < 6:
        pass
    
    next_best = select_next_best_action(final_tasks)
    
    return RoadmapResponse(
        tasks=final_tasks,
        generated_at=date.today().isoformat(),
        profile_completeness=compute_profile_completeness(profile, portfolio),
        top_matches_count=len(matches),
        next_best_action=next_best,
    )