import argparse
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import ClassVar, Dict, Iterable, List, Tuple


try:
    from pydantic import BaseModel, ValidationError, field_validator
except Exception as exc:  # pragma: no cover - dependency gate
    print("ERROR: pydantic is required to run this validator.")
    print(f"DETAILS: {exc}")
    sys.exit(2)


def _normalize_heading(text: str) -> str:
    text = text.strip().lower()
    text = re.sub(r"^\d+[\.\)]*\s+", "", text)
    text = re.sub(r"[^a-z0-9\s]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text


@dataclass
class ParsedMarkdown:
    headings: Dict[str, str]


def parse_markdown_sections(content: str) -> ParsedMarkdown:
    headings: Dict[str, List[str]] = {}
    stack: List[Tuple[int, str]] = []

    for line in content.splitlines():
        match = re.match(r"^(#{1,6})\s+(.*)$", line)
        if match:
            level = len(match.group(1))
            heading_text = match.group(2).strip()
            key = _normalize_heading(heading_text)
            while stack and stack[-1][0] >= level:
                stack.pop()
            stack.append((level, key))
            headings.setdefault(key, [])
            continue

        if not stack:
            continue

        for _, key in stack:
            headings.setdefault(key, []).append(line)

    merged = {key: "\n".join(lines).strip() for key, lines in headings.items()}
    return ParsedMarkdown(headings=merged)


class IdeationDoc(BaseModel):
    sections: Dict[str, str]

    required_sections: ClassVar[Tuple[str, ...]] = (
        "purpose intent",
        "how it works",
        "review of related literature",
        "list of connected ideas",
        "dependencies",
        "program flow scenario expected outcome",
        "at a glance bullet list of outcomes",
        "review of results from tests",
        "list of rejected ideas with reasons",
        "list of waitlisted ideas",
    )

    @field_validator("sections")
    @classmethod
    def ensure_required_sections(cls, sections: Dict[str, str]) -> Dict[str, str]:
        missing = [name for name in cls.required_sections if name not in sections]
        if missing:
            raise ValueError(f"Missing required sections: {', '.join(missing)}")

        empty = [name for name in cls.required_sections if not sections.get(name, "").strip()]
        if empty:
            raise ValueError(f"Empty required sections: {', '.join(empty)}")

        return sections


class PlanDoc(BaseModel):
    sections: Dict[str, str]

    required_sections: ClassVar[Tuple[str, ...]] = (
        "scope",
        "success metrics",
        "dependencies",
        "risks and mitigations",
        "milestones",
        "task checklist",
        "verification steps",
        "implementation notes",
        "handoff",
    )

    @field_validator("sections")
    @classmethod
    def ensure_required_sections(cls, sections: Dict[str, str]) -> Dict[str, str]:
        missing = [name for name in cls.required_sections if name not in sections]
        if missing:
            raise ValueError(f"Missing required sections: {', '.join(missing)}")

        empty = [name for name in cls.required_sections if not sections.get(name, "").strip()]
        if empty:
            raise ValueError(f"Empty required sections: {', '.join(empty)}")

        return sections


def load_and_validate(path: Path, doc_type: str):
    content = path.read_text(encoding="utf-8")
    parsed = parse_markdown_sections(content)
    sections = dict(parsed.headings)
    if "ataglance bullet list of outcomes" in sections:
        sections.setdefault("at a glance bullet list of outcomes", sections["ataglance bullet list of outcomes"])

    if doc_type == "ideation":
        return IdeationDoc(sections=sections)
    if doc_type == "plan":
        return PlanDoc(sections=sections)
    raise ValueError(f"Unknown doc type: {doc_type}")


def run_validation(ideation_path: Path, plan_path: Path) -> int:
    errors: List[str] = []

    for label, path in (("ideation", ideation_path), ("plan", plan_path)):
        if not path.exists():
            errors.append(f"{label} file not found: {path}")
            continue

        try:
            load_and_validate(path, label)
        except ValidationError as exc:
            errors.append(f"{label} validation failed for {path}:\n{exc}")
        except Exception as exc:
            errors.append(f"{label} validation error for {path}: {exc}")

    if errors:
        print("VALIDATION FAILED")
        for error in errors:
            print("-" * 80)
            print(error)
        return 1

    print("VALIDATION PASSED")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Validate ideation and implementation plan docs against workflow requirements."
    )
    parser.add_argument("--ideation", required=True, help="Path to ideation markdown file.")
    parser.add_argument("--plan", required=True, help="Path to implementation plan markdown file.")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    ideation_path = Path(args.ideation)
    plan_path = Path(args.plan)
    return run_validation(ideation_path, plan_path)


if __name__ == "__main__":
    raise SystemExit(main())
