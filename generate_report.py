#!/usr/bin/env python3
"""
Generate a GitHub/Git activity report for the July-August period.

Usage:
    pip install reportlab matplotlib
    python generate_report.py final

The script reads the local Git repository, so it works in GitHub Codespaces
without requiring a GitHub API token.

Default report period:
    July 1, 2026 through August 31, 2026 (inclusive)

If your assignment is for a different year, change START_DATE and END_DATE
below.
"""

import os
import sys
import subprocess
from collections import Counter
from datetime import datetime
from pathlib import Path

# =========================
# REPORT PERIOD
# =========================
START_DATE = "2026-07-01"
END_DATE = "2026-09-01"  # exclusive; includes all of August 31

OUTPUT_PDF = "github_july_august_report.pdf"
CHART_DIR = Path("report_charts")


def run_git(args):
    """Run a git command and return stdout."""
    result = subprocess.run(
        ["git"] + args,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "Git command failed.")
    return result.stdout.strip()


def repo_name():
    try:
        remote = run_git(["config", "--get", "remote.origin.url"])
        if remote:
            remote = remote.rstrip("/")
            if remote.endswith(".git"):
                remote = remote[:-4]
            return remote.split("/")[-1]
    except Exception:
        pass
    return Path.cwd().name


def get_commits():
    """Return commits in the requested period."""
    fmt = "%H%x1f%an%x1f%ae%x1f%ad%x1f%s%x1e"
    raw = run_git([
        "log",
        "--all",
        f"--since={START_DATE}",
        f"--until={END_DATE}",
        "--date=iso",
        f"--pretty=format:{fmt}",
    ])

    commits = []
    if not raw:
        return commits

    for record in raw.split("\x1e"):
        record = record.strip()
        if not record:
            continue
        parts = record.split("\x1f")
        if len(parts) != 5:
            continue

        sha, author, email, date_text, subject = parts
        try:
            dt = datetime.fromisoformat(date_text.strip())
        except ValueError:
            dt = None

        commits.append({
            "sha": sha,
            "author": author,
            "email": email,
            "date": dt,
            "subject": subject.strip(),
        })

    commits.sort(key=lambda x: x["date"] or datetime.min)
    return commits


def get_numstat():
    """Return total insertions/deletions and file-level change counts."""
    raw = run_git([
        "log",
        "--all",
        f"--since={START_DATE}",
        f"--until={END_DATE}",
        "--numstat",
        "--format=COMMIT:%H",
    ])

    additions = 0
    deletions = 0
    files = Counter()

    for line in raw.splitlines():
        line = line.strip()
        if not line or line.startswith("COMMIT:"):
            continue

        parts = line.split("\t")
        if len(parts) != 3:
            continue

        a, d, filename = parts

        # Binary files show "-" instead of numbers.
        if a.isdigit():
            additions += int(a)
        if d.isdigit():
            deletions += int(d)

        files[filename] += 1

    return additions, deletions, files


def make_charts(commits):
    import matplotlib.pyplot as plt

    CHART_DIR.mkdir(exist_ok=True)

    # Monthly commits
    month_counts = Counter()
    for c in commits:
        if c["date"]:
            month_counts[c["date"].strftime("%b %Y")] += 1

    labels = ["Jul 2026", "Aug 2026"]
    values = [month_counts.get(x, 0) for x in labels]

    plt.figure(figsize=(8, 4.5))
    plt.bar(labels, values)
    plt.title("Commits by Month")
    plt.xlabel("Month")
    plt.ylabel("Number of Commits")
    plt.tight_layout()
    monthly_path = CHART_DIR / "commits_by_month.png"
    plt.savefig(monthly_path, dpi=180)
    plt.close()

    # Author commits
    author_counts = Counter(c["author"] for c in commits)
    authors = list(author_counts.keys())
    author_values = list(author_counts.values())

    if authors:
        # Keep the chart readable if there are many contributors.
        pairs = sorted(
            zip(authors, author_values),
            key=lambda x: x[1],
            reverse=True
        )[:10]
        authors, author_values = zip(*pairs)

        plt.figure(figsize=(8, max(4.5, len(authors) * 0.5)))
        plt.barh(list(authors)[::-1], list(author_values)[::-1])
        plt.title("Commits by Contributor")
        plt.xlabel("Number of Commits")
        plt.ylabel("Contributor")
        plt.tight_layout()
        author_path = CHART_DIR / "commits_by_contributor.png"
        plt.savefig(author_path, dpi=180)
        plt.close()
    else:
        author_path = None

    # Daily commit activity
    daily_counts = Counter()
    for c in commits:
        if c["date"]:
            daily_counts[c["date"].date()] += 1

    if daily_counts:
        dates = sorted(daily_counts)
        values = [daily_counts[d] for d in dates]

        plt.figure(figsize=(10, 4.5))
        plt.plot(dates, values, marker="o", linewidth=1.5, markersize=3)
        plt.title("Daily Commit Activity")
        plt.xlabel("Date")
        plt.ylabel("Commits")
        plt.xticks(rotation=45)
        plt.tight_layout()
        daily_path = CHART_DIR / "daily_commit_activity.png"
        plt.savefig(daily_path, dpi=180)
        plt.close()
    else:
        daily_path = None

    return monthly_path, author_path, daily_path


def build_pdf(commits, additions, deletions, files):
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_CENTER
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import mm
    from reportlab.platypus import (
        SimpleDocTemplate,
        Paragraph,
        Spacer,
        Table,
        TableStyle,
        Image,
        PageBreak,
    )

    monthly_path, author_path, daily_path = make_charts(commits)

    pdf = SimpleDocTemplate(
        OUTPUT_PDF,
        pagesize=A4,
        rightMargin=15 * mm,
        leftMargin=15 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
        title="GitHub Project Activity Report - July to August 2026",
        author="Generated from Git repository",
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        fontSize=22,
        leading=27,
        spaceAfter=12,
    )
    subtitle_style = ParagraphStyle(
        "Subtitle",
        parent=styles["Normal"],
        alignment=TA_CENTER,
        fontSize=11,
        leading=15,
        spaceAfter=18,
    )
    heading_style = ParagraphStyle(
        "Heading",
        parent=styles["Heading2"],
        fontSize=15,
        leading=18,
        spaceBefore=10,
        spaceAfter=8,
    )
    small_style = ParagraphStyle(
        "Small",
        parent=styles["Normal"],
        fontSize=8.5,
        leading=11,
    )

    story = []

    # Cover / summary
    story.append(Paragraph("GitHub Project Activity Report", title_style))
    story.append(Paragraph(
        "Reporting Period: 1 July 2026 – 31 August 2026",
        subtitle_style,
    ))
    story.append(Paragraph(
        f"<b>Repository:</b> {repo_name()}",
        styles["Normal"],
    ))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        f"<b>Generated:</b> {datetime.now().strftime('%d %B %Y, %I:%M %p')}",
        styles["Normal"],
    ))
    story.append(Spacer(1, 16))

    author_counts = Counter(c["author"] for c in commits)

    summary_data = [
        ["Metric", "Value"],
        ["Total commits", str(len(commits))],
        ["Contributors", str(len(author_counts))],
        ["Lines added", f"{additions:,}"],
        ["Lines deleted", f"{deletions:,}"],
        ["Files changed", str(len(files))],
    ]

    table = Table(summary_data, colWidths=[85 * mm, 70 * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#333333")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1),
         [colors.whitesmoke, colors.lightgrey]),
        ("ALIGN", (1, 1), (1, -1), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.append(table)

    # Charts
    story.append(PageBreak())
    story.append(Paragraph("Activity Overview", heading_style))
    story.append(Image(str(monthly_path), width=165 * mm, height=93 * mm))

    if author_path:
        story.append(Spacer(1, 8))
        story.append(Image(str(author_path), width=165 * mm, height=93 * mm))

    if daily_path:
        story.append(PageBreak())
        story.append(Paragraph("Daily Commit Activity", heading_style))
        story.append(Image(str(daily_path), width=170 * mm, height=76 * mm))

    # Contributors
    story.append(Paragraph("Contributor Summary", heading_style))
    contributor_rows = [["Contributor", "Commits"]]
    for author, count in author_counts.most_common():
        contributor_rows.append([author, str(count)])

    if len(contributor_rows) == 1:
        contributor_rows.append(["No commits found", "0"])

    contributor_table = Table(
        contributor_rows,
        colWidths=[110 * mm, 45 * mm],
        repeatRows=1,
    )
    contributor_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#333333")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1),
         [colors.whitesmoke, colors.lightgrey]),
        ("ALIGN", (1, 1), (1, -1), "RIGHT"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(contributor_table)

    # File summary
    story.append(PageBreak())
    story.append(Paragraph("Most Frequently Changed Files", heading_style))
    file_rows = [["File", "Changes"]]
    for filename, count in files.most_common(20):
        file_rows.append([
            Paragraph(filename.replace("&", "&amp;"), small_style),
            str(count),
        ])

    if len(file_rows) == 1:
        file_rows.append(["No changed files found", "0"])

    file_table = Table(
        file_rows,
        colWidths=[130 * mm, 25 * mm],
        repeatRows=1,
    )
    file_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#333333")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1),
         [colors.whitesmoke, colors.lightgrey]),
        ("ALIGN", (1, 1), (1, -1), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(file_table)

    # Commit log
    story.append(Paragraph("Commit History", heading_style))
    commit_rows = [["Date", "Contributor", "Commit", "Message"]]

    for c in commits:
        date_str = c["date"].strftime("%d-%m-%Y %H:%M") if c["date"] else "-"
        sha_short = c["sha"][:7]
        commit_rows.append([
            date_str,
            c["author"],
            sha_short,
            Paragraph(c["subject"].replace("&", "&amp;"), small_style),
        ])

    if len(commit_rows) == 1:
        commit_rows.append(["-", "-", "-", "No commits found for this period."])

    commit_table = Table(
        commit_rows,
        colWidths=[30 * mm, 38 * mm, 20 * mm, 87 * mm],
        repeatRows=1,
    )
    commit_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#333333")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 7.5),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.grey),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1),
         [colors.white, colors.whitesmoke]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(commit_table)

    pdf.build(story)


def main():
    if len(sys.argv) < 2 or sys.argv[1].lower() != "final":
        print("Usage: python generate_report.py final")
        sys.exit(1)

    if not (Path(".git").exists() or os.path.isdir(".git")):
        print("ERROR: Run this script from the root of your Git repository.")
        sys.exit(1)

    print("Collecting Git activity...")
    commits = get_commits()
    additions, deletions, files = get_numstat()

    print(f"Commits found: {len(commits)}")
    print(f"Lines added: {additions}")
    print(f"Lines deleted: {deletions}")
    print(f"Files changed: {len(files)}")

    if not commits:
        print()
        print("WARNING: No commits were found between 1 July and 31 August 2026.")
        print("If your assignment uses another year, edit START_DATE and END_DATE")
        print("at the top of generate_report.py and run the command again.")

    build_pdf(commits, additions, deletions, files)

    print()
    print(f"REPORT CREATED: {OUTPUT_PDF}")
    print(f"Open/download this PDF and print it for the hardcopy submission.")


if __name__ == "__main__":
    main()
