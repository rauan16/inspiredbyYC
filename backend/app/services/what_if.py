import copy
import json
from typing import Optional

from app.data.universities import universities as uni_data
from app.schemas.roadmap import TaskCategory, TaskPriority, TaskStatus
from app.schemas.what_if import (
    NextActionDiff,
    RecommendationsDiff,
    RoadmapDiff,
    RoadmapTaskDiff,
    ScenarioProfile,
    UniversityMatchDiff,
    WhatIfField,
    WhatIfRequest,
    WhatIfResponse,
)
from app.services.matching import (
    StudentMatchingProfile,
    UniversityMatch,
    get_recommendations_for_profile,
    normalize_student_profile,
)
from app.services.roadmap import (
    RoadmapResponse,
    generate_roadmap,
    select_next_best_action,
)


def apply_scenario_change(profile: dict, portfolio: list[dict], field: WhatIfField, value: str | int | float | list[str]) -> dict:
    """Create a copy of the profile with the scenario change applied."""
    scenario_profile = copy.deepcopy(profile)
    academic = scenario_profile.setdefault("academicInfo", {})

    if field == WhatIfField.IELTS:
        academic["englishTest"] = "IELTS"
        academic["englishScore"] = float(value)
        academic["ielts"] = float(value)
    elif field == WhatIfField.SAT:
        academic["sat"] = int(value)
        academic["satScore"] = int(value)
    elif field == WhatIfField.BUDGET:
        academic["budgetMax"] = int(value)
        academic["budgetCurrency"] = "USD"
    elif field == WhatIfField.PREFERRED_COUNTRY:
        if isinstance(value, list):
            academic["preferredCountries"] = value
        else:
            academic["preferredCountries"] = [value]
    elif field == WhatIfField.INTENDED_MAJOR:
        academic["intendedMajor"] = str(value)
        academic["primaryField"] = str(value)
    else:
        raise ValueError(f"Unsupported field: {field}")

    return scenario_profile


def get_field_display_value(profile: dict, field: WhatIfField) -> str | int | float | list[str] | None:
    """Get the current value of a field from the profile for display."""
    academic = profile.get("academicInfo") or {}

    if field == WhatIfField.IELTS:
        return academic.get("ielts") or academic.get("englishScore") if academic.get("englishTest") == "IELTS" else None
    elif field == WhatIfField.SAT:
        return academic.get("sat") or academic.get("satScore")
    elif field == WhatIfField.BUDGET:
        return academic.get("budgetMax")
    elif field == WhatIfField.PREFERRED_COUNTRY:
        return academic.get("preferredCountries", [])
    elif field == WhatIfField.INTENDED_MAJOR:
        return academic.get("intendedMajor") or academic.get("primaryField")
    return None


def compute_matching_diff(
    before_matches: list[UniversityMatch],
    after_matches: list[UniversityMatch],
) -> RecommendationsDiff:
    """Compute the diff between before and after university matches."""
    before_dict = {m.university_id: m for m in before_matches}
    after_dict = {m.university_id: m for m in after_matches}

    all_ids = set(before_dict.keys()) | set(after_dict.keys())

    before_top = []
    after_top = []
    added = []
    removed = []
    changed_scores = []

    for uid in sorted(all_ids):
        before = before_dict.get(uid)
        after = after_dict.get(uid)

        if before and after:
            score_change = after.match_score - before.match_score
            category_changed = before.category != after.category
            match_diff = UniversityMatchDiff(
                university_id=uid,
                name=after.name,
                country=after.country,
                before_score=before.match_score,
                after_score=after.match_score,
                score_change=score_change,
                before_category=before.category,
                after_category=after.category,
                category_changed=category_changed,
            )
            before_top.append(match_diff)
            after_top.append(match_diff)
            if score_change != 0 or category_changed:
                changed_scores.append(match_diff)
        elif before and not after:
            removed.append(UniversityMatchDiff(
                university_id=uid,
                name=before.name,
                country=before.country,
                before_score=before.match_score,
                after_score=None,
                score_change=-before.match_score,
                before_category=before.category,
                after_category=None,
                category_changed=True,
            ))
        elif after and not before:
            added.append(UniversityMatchDiff(
                university_id=uid,
                name=after.name,
                country=after.country,
                before_score=None,
                after_score=after.match_score,
                score_change=after.match_score,
                before_category=None,
                after_category=after.category,
                category_changed=True,
            ))

    return RecommendationsDiff(
        before_top_matches=before_top,
        after_top_matches=after_top,
        added=added,
        removed=removed,
        changed_scores=changed_scores,
    )


def compute_roadmap_diff(before_roadmap: RoadmapResponse, after_roadmap: RoadmapResponse) -> RoadmapDiff:
    """Compute the diff between before and after roadmap tasks."""
    before_tasks = {t.id: t for t in before_roadmap.tasks}
    after_tasks = {t.id: t for t in after_roadmap.tasks}

    before_ids = set(before_tasks.keys())
    after_ids = set(after_tasks.keys())

    added_ids = after_ids - before_ids
    removed_ids = before_ids - after_ids
    common_ids = before_ids & after_ids

    added_tasks = [
        RoadmapTaskDiff(
            id=t.id,
            title=t.title,
            category=t.category.value,
            priority=t.priority.value,
            status=t.status.value,
        )
        for t in after_roadmap.tasks if t.id in added_ids
    ]

    removed_tasks = [
        RoadmapTaskDiff(
            id=t.id,
            title=t.title,
            category=t.category.value,
            priority=t.priority.value,
            status=t.status.value,
        )
        for t in before_roadmap.tasks if t.id in removed_ids
    ]

    unchanged_count = sum(1 for uid in common_ids if before_tasks[uid].title == after_tasks[uid].title)

    return RoadmapDiff(
        added_tasks=added_tasks,
        removed_tasks=removed_tasks,
        unchanged_count=unchanged_count,
    )


def compute_next_action_diff(before_roadmap: RoadmapResponse, after_roadmap: RoadmapResponse) -> NextActionDiff:
    """Compute the diff between before and after next best action."""
    before_nba = before_roadmap.next_best_action
    after_nba = after_roadmap.next_best_action

    before_diff = None
    after_diff = None

    if before_nba:
        before_diff = RoadmapTaskDiff(
            id=before_nba.task_id,
            title=before_nba.title,
            category=before_nba.category.value,
            priority=before_nba.priority.value,
            status="pending" if not before_nba.completed else "completed",
        )

    if after_nba:
        after_diff = RoadmapTaskDiff(
            id=after_nba.task_id,
            title=after_nba.title,
            category=after_nba.category.value,
            priority=after_nba.priority.value,
            status="pending" if not after_nba.completed else "completed",
        )

    changed = False
    if before_nba and after_nba:
        changed = before_nba.task_id != after_nba.task_id
    elif before_nba != after_nba:
        changed = True

    return NextActionDiff(
        before=before_diff,
        after=after_diff,
        changed=changed,
    )


def generate_summary(
    field: WhatIfField,
    before_value: str | int | float | list[str] | None,
    after_value: str | int | float | list[str],
    recommendations_diff: RecommendationsDiff,
    roadmap_diff: RoadmapDiff,
    next_action_diff: NextActionDiff,
) -> str:
    """Generate a deterministic summary based on actual diffs."""
    field_ru = {
        WhatIfField.IELTS: "IELTS",
        WhatIfField.SAT: "SAT",
        WhatIfField.BUDGET: "бюджет",
        WhatIfField.PREFERRED_COUNTRY: "предпочитаемую страну",
        WhatIfField.INTENDED_MAJOR: "предназначенное направление",
    }

    field_name = field_ru.get(field, field.value)

    # Check for specific task removals
    removed_titles = [t.title for t in roadmap_diff.removed_tasks]
    added_titles = [t.title for t in roadmap_diff.added_tasks]

    if field == WhatIfField.IELTS:
        if "Сдать IELTS или TOEFL" in removed_titles:
            return f"После повышения IELTS с {before_value} до {after_value} задача по сдаче IELTS исчезла из roadmap."
        if "Повысить IELTS" in removed_titles:
            return f"После повышения IELTS с {before_value} до {after_value} задача по улучшению IELTS исчезла из roadmap."

    if field == WhatIfField.SAT:
        if "Сдать SAT или ACT" in removed_titles:
            return f"После повышения SAT с {before_value} до {after_value} задача по сдаче SAT исчезла из roadmap."
        if "Повысить SAT" in removed_titles:
            return f"После повышения SAT с {before_value} до {after_value} задача по улучшению SAT исчезла из roadmap."

    if field == WhatIfField.PREFERRED_COUNTRY:
        if recommendations_diff.added or recommendations_diff.removed:
            return f"После смены предпочитаемой страны на {after_value} изменился список рекомендуемых университетов."

    if field == WhatIfField.BUDGET:
        if recommendations_diff.added or recommendations_diff.removed:
            return f"После изменения бюджета на {after_value} изменился список рекомендуемых университетов."

    if field == WhatIfField.INTENDED_MAJOR:
        if recommendations_diff.added or recommendations_diff.removed:
            return f"После смены направления на {after_value} изменился список рекомендуемых университетов."

    if roadmap_diff.removed_tasks:
        removed = roadmap_diff.removed_tasks[0].title
        return f"После изменения {field_name} задача «{removed}» исчезла из roadmap."

    if roadmap_diff.added_tasks:
        added = roadmap_diff.added_tasks[0].title
        return f"После изменения {field_name} в roadmap появилась задача «{added}»."

    if next_action_diff.changed:
        return f"После изменения {field_name} следующий рекомендуемый шаг изменился."

    if recommendations_diff.changed_scores:
        changed = len(recommendations_diff.changed_scores)
        return f"После изменения {field_name} изменились Match-оценки у {changed} университетов."

    return f"Изменение {field_name} на {after_value} не привело к существенным изменениям в рекомендациях."


def run_what_if_simulation(
    profile: dict,
    portfolio: list[dict],
    request: WhatIfRequest,
) -> WhatIfResponse:
    """Run the complete What-If simulation and return structured diff."""
    # Get current value for display
    before_value = get_field_display_value(profile, request.field)

    # Create scenario profile
    scenario_profile = apply_scenario_change(profile, portfolio, request.field, request.value)

    # Calculate BEFORE (real profile)
    before_matches = get_recommendations_for_profile(profile, portfolio, uni_data, limit=10)
    before_roadmap = generate_roadmap(profile, portfolio)

    # Calculate AFTER (scenario profile)
    after_matches = get_recommendations_for_profile(scenario_profile, portfolio, uni_data, limit=10)
    after_roadmap = generate_roadmap(scenario_profile, portfolio)

    # Compute diffs
    recommendations_diff = compute_matching_diff(before_matches, after_matches)
    roadmap_diff = compute_roadmap_diff(before_roadmap, after_roadmap)
    next_action_diff = compute_next_action_diff(before_roadmap, after_roadmap)

    # Generate summary
    summary = generate_summary(
        request.field,
        before_value,
        request.value,
        recommendations_diff,
        roadmap_diff,
        next_action_diff,
    )

    return WhatIfResponse(
        scenario=ScenarioProfile(
            field=request.field.value,
            before=before_value,
            after=request.value,
        ),
        recommendations=recommendations_diff,
        roadmap=roadmap_diff,
        next_action=next_action_diff,
        summary=summary,
    )