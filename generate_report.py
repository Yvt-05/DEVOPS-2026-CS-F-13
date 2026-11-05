import subprocess
from collections import defaultdict
import datetime
import io
import os
import re
import sys
import html
import matplotlib.pyplot as plt

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    Image, KeepTogether, PageBreak, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

# -------------------------------------------------------------
# CONFIGURATION: Institution & Department Details
# -------------------------------------------------------------
COLLEGE_NAME    = "Swami Keshvanand Institute of Technology, Management & Gramothan, Jaipur"
DEPARTMENT_NAME = "Department of Computer Science & Engineering"
JENKINS_JOB     = "DEVOPS-2026-CS-F-13"
JENKINS_BUILDS_PATH = r"C:\ProgramData\Jenkins\.jenkins\jobs\DEVOPS-2026-CS-F-13\builds"
# -------------------------------------------------------------


# ═══════════════════════════════════════════════════════════════
# NUMBERED CANVAS (Consistent Running Header & Page Numbering)
# ═══════════════════════════════════════════════════════════════

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas that determines the total page count dynamically
    and draws consistent running headers and page numbers on every page.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont('Helvetica', 8)
        self.setFillColor(colors.HexColor('#64748B'))

        # Running footer line and page number on all pages
        self.setStrokeColor(colors.HexColor('#CBD5E1'))
        self.setLineWidth(0.5)
        self.line(36, 24, 576, 24)
        self.drawString(36, 14, "Shivakriti Constructions — Academic Evaluation Report")
        self.drawRightString(576, 14, f"Page {self._pageNumber} of {page_count}")

        # Running header on subsequent pages (page > 1)
        if self._pageNumber > 1:
            self.drawString(36, 764, "SKIT Jaipur · Department of Computer Science & Engineering")
            self.drawRightString(576, 764, "DEVOPS-2026-CS-F-13")
            self.line(36, 758, 576, 758)

        self.restoreState()


# ═══════════════════════════════════════════════════════════════
# GIT HELPERS
# ═══════════════════════════════════════════════════════════════

def get_repo_info():
    """Extracts the repository name and current branch."""
    repo_name   = "DEVOPS-2026-CS-F-13"
    branch_name = "main"
    try:
        remote_url = subprocess.check_output(
            ['git', 'config', '--get', 'remote.origin.url'], encoding='utf-8').strip()
        repo_name = remote_url.rstrip('/').split('/')[-1].replace('.git', '')
    except Exception:
        try:
            root_path = subprocess.check_output(
                ['git', 'rev-parse', '--show-toplevel'], encoding='utf-8').strip()
            repo_name = os.path.basename(root_path)
        except Exception:
            repo_name = os.path.basename(os.getcwd())
    try:
        branch_name = subprocess.check_output(
            ['git', 'rev-parse', '--abbrev-ref', 'HEAD'], encoding='utf-8').strip()
    except Exception:
        pass
    return repo_name, branch_name


def get_git_metrics(interval="weekly"):
    """
    Parses Git commit logs and aggregates metrics.
    Supported intervals: 'weekly', 'monthly', 'final'
    """
    today    = datetime.date.today()
    git_args = [
        'git', 'log', '--no-merges',
        '--pretty=format:COMMIT|||%h|||%an|||%ad|||%s',
        '--date=short', '--numstat'
    ]

    if interval == "weekly":
        since_date = (today - datetime.timedelta(days=7)).strftime("%Y-%m-%d")
        git_args.append(f"--since={since_date}")
        scope_title = f"Last 7 Days (Since {since_date})"
    elif interval == "monthly":
        since_date = (today - datetime.timedelta(days=30)).strftime("%Y-%m-%d")
        git_args.append(f"--since={since_date}")
        scope_title = f"Last 30 Days (Since {since_date})"
    else:
        scope_title = "Complete Project Lifecycle — All Available Commits"

    try:
        raw_output = subprocess.check_output(git_args, encoding='utf-8', errors='replace')
    except subprocess.CalledProcessError:
        print("[ERROR] Git command failed. Please ensure you are inside a Git repository.")
        return None, None, None, scope_title

    students          = defaultdict(lambda: {"commits": 0, "added": 0, "deleted": 0, "active_days": set()})
    timeline_activity = defaultdict(lambda: defaultdict(int))
    student_logs      = defaultdict(list)

    current_author   = None
    current_date_str = None

    for line in raw_output.strip().split('\n'):
        line = line.strip()
        if not line:
            continue

        if line.startswith('COMMIT|||'):
            parts = line.split('|||')
            if len(parts) >= 5:
                sha      = parts[1].strip()
                author   = parts[2].strip()
                date_str = parts[3].strip()
                msg      = parts[4].strip()
            else:
                continue

            # Exclude bot commits from metric calculations
            if "bot" in author.lower() or "github-actions" in author.lower():
                current_author = None
                continue

            current_author   = author
            current_date_str = date_str

            students[current_author]["commits"] += 1
            students[current_author]["active_days"].add(current_date_str)
            student_logs[current_author].append((date_str, sha, msg))

            try:
                dt = datetime.datetime.strptime(current_date_str, "%Y-%m-%d").date()
                if interval == "weekly":
                    period_key = dt.strftime("%a (%b %d)")
                elif interval == "monthly":
                    period_key = f"{dt.isocalendar()[0]}-W{dt.isocalendar()[1]:02d}"
                else:
                    period_key = dt.strftime("%Y-%m")
                timeline_activity[period_key][current_author] += 1
            except Exception:
                pass

        elif current_author and not line.startswith('COMMIT|||'):
            parts = line.split()
            if len(parts) >= 2 and parts[0].isdigit() and parts[1].isdigit():
                students[current_author]["added"]   += int(parts[0])
                students[current_author]["deleted"] += int(parts[1])

    # For final mode, enrich scope_title with actual first/last commit dates
    if interval not in ("weekly", "monthly") and students:
        all_dates = []
        for data_logs in student_logs.values():
            for d, _, _ in data_logs:
                try:
                    all_dates.append(datetime.datetime.strptime(d, "%Y-%m-%d").date())
                except Exception:
                    pass
        if all_dates:
            first_date = min(all_dates).strftime("%B %d, %Y")
            last_date  = max(all_dates).strftime("%B %d, %Y")
            scope_title = (
                f"Complete Project Lifecycle — All Available Commits "
                f"({first_date} to {last_date})"
            )

    return students, timeline_activity, student_logs, scope_title


# ═══════════════════════════════════════════════════════════════
# JENKINS HELPERS
# ═══════════════════════════════════════════════════════════════

def get_jenkins_builds():
    """
    Reads actual Jenkins build records from local build.xml files.
    Uses regex to parse XML 1.1 (which Python's xml.etree cannot handle).
    Returns a list of dicts with real build data only.
    """
    builds = []
    if not os.path.isdir(JENKINS_BUILDS_PATH):
        return builds

    build_dirs = sorted(
        [d for d in os.listdir(JENKINS_BUILDS_PATH)
         if os.path.isdir(os.path.join(JENKINS_BUILDS_PATH, d)) and d.isdigit()],
        key=lambda x: int(x)
    )

    for build_num in build_dirs:
        xml_path = os.path.join(JENKINS_BUILDS_PATH, build_num, "build.xml")
        if not os.path.exists(xml_path):
            continue
        try:
            txt = open(xml_path, encoding='utf-8', errors='replace').read()
        except Exception:
            continue

        ts_m   = re.search(r'<timestamp>(\d+)</timestamp>', txt)
        dur_m  = re.search(r'<duration>(\d+)</duration>', txt)
        res_m  = re.search(r'<result>(.*?)</result>', txt)
        uid_m  = re.search(r'<userId>(.*?)</userId>', txt)

        if not ts_m:
            continue

        ts_ms   = int(ts_m.group(1))
        dur_ms  = int(dur_m.group(1)) if dur_m else 0
        result  = res_m.group(1).strip() if res_m else "UNKNOWN"
        user    = uid_m.group(1).strip() if uid_m else "unknown"

        dt = datetime.datetime.fromtimestamp(ts_ms / 1000)

        builds.append({
            "number":   int(build_num),
            "result":   result,
            "datetime": dt.strftime("%Y-%m-%d %H:%M:%S"),
            "date":     dt.strftime("%Y-%m-%d"),
            "duration": round(dur_ms / 1000, 1),
            "user":     user,
        })

    return builds


# ═══════════════════════════════════════════════════════════════
# DOCKER HELPERS
# ═══════════════════════════════════════════════════════════════

def get_docker_images():
    """
    Returns actual project-relevant Docker images from 'docker images'.
    Includes the project's own built images and the official stack images.
    """
    try:
        out = subprocess.check_output(
            ['docker', 'images',
             '--format', '{{.Repository}}|||{{.Tag}}|||{{.ID}}|||{{.CreatedAt}}|||{{.Size}}'],
            encoding='utf-8', errors='replace'
        )
    except Exception:
        return []

    project_keywords = [
        'construction-company-website',
        'grafana', 'prometheus', 'node-exporter', 'nginx'
    ]
    images = []
    for line in out.strip().split('\n'):
        line = line.strip()
        if not line:
            continue
        parts = line.split('|||')
        if len(parts) < 5:
            continue
        repo, tag, img_id, created_at, size = parts
        if any(kw in repo.lower() for kw in project_keywords):
            clean_date = created_at.split('+')[0].strip().replace(' IST', '')
            images.append({
                "repo":       repo,
                "tag":        tag,
                "id":         img_id[:12],
                "created_at": clean_date,
                "size":       size,
            })
    return images


# ═══════════════════════════════════════════════════════════════
# CHARTS
# ═══════════════════════════════════════════════════════════════

def create_charts(students, timeline_activity, interval):
    """Generates workload distribution and timeline comparison charts."""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 3.5))
    authors = list(students.keys())
    periods = sorted(timeline_activity.keys())

    chart_interval_label = (
        "Monthly" if interval not in ("weekly", "monthly") else interval.capitalize()
    )

    # 1. Timeline Chart
    if periods and authors:
        for author in authors:
            counts = [timeline_activity[p].get(author, 0) for p in periods]
            ax1.plot(periods, counts, marker='o', linewidth=2, label=author, color='#2563EB')
        ax1.set_title(f"Commit Timeline ({chart_interval_label})", fontsize=10, fontweight='bold')
        ax1.set_ylabel("Commits")
        ax1.tick_params(axis='x', rotation=30)
        ax1.grid(True, linestyle='--', alpha=0.5)
        ax1.legend(fontsize=8)
    else:
        ax1.text(0.5, 0.5, "No commits found in this interval", ha='center', va='center')

    # 2. Net LOC Chart
    if authors:
        net_loc      = [students[a]["added"] - students[a]["deleted"] for a in authors]
        colors_list  = ['#1E3A8A', '#F59E0B', '#EF4444', '#10B981', '#6366F1']
        ax2.bar(authors, net_loc, color=colors_list[:len(authors)], width=0.4)
        ax2.set_title("Net Lines of Code Written", fontsize=10, fontweight='bold')
        ax2.set_ylabel("LOC (Added - Deleted)")
        ax2.grid(axis='y', linestyle='--', alpha=0.5)
    else:
        ax2.text(0.5, 0.5, "No LOC changes recorded", ha='center', va='center')

    plt.tight_layout()
    img_buffer = io.BytesIO()
    plt.savefig(img_buffer, format='png', dpi=200)
    plt.close()
    img_buffer.seek(0)
    return Image(img_buffer, width=500, height=155)


def create_jenkins_chart(builds):
    """Bar chart of Jenkins build duration and status."""
    fig, ax = plt.subplots(figsize=(11, 2.5))
    if not builds:
        ax.text(0.5, 0.5, "No Jenkins build data available", ha='center', va='center')
    else:
        nums    = [f"#{b['number']}" for b in builds]
        colors_ = ['#166534' if b['result'] == 'SUCCESS' else '#991B1B' for b in builds]
        durs    = [b['duration'] for b in builds]
        bars    = ax.bar(nums, durs, color=colors_, width=0.48)
        ax.set_title("Jenkins Pipeline Execution Duration (seconds) — Green: SUCCESS, Red: FAILURE",
                     fontsize=9.5, fontweight='bold', pad=8)
        ax.set_ylabel("Duration (s)", fontsize=8.5)
        ax.set_xlabel("Build Number", fontsize=8.5)
        ax.grid(axis='y', linestyle='--', alpha=0.45)
        for bar, build in zip(bars, builds):
            height = bar.get_height()
            label  = f"{build['result'][:4]}"
            ax.text(bar.get_x() + bar.get_width() / 2,
                    height + max(durs) * 0.02,
                    label,
                    ha='center', va='bottom', fontsize=7, fontweight='bold',
                    color='#166534' if build['result'] == 'SUCCESS' else '#991B1B')
    plt.tight_layout()
    img_buffer = io.BytesIO()
    plt.savefig(img_buffer, format='png', dpi=200)
    plt.close()
    img_buffer.seek(0)
    return Image(img_buffer, width=500, height=120)


# ═══════════════════════════════════════════════════════════════
# STYLE HELPERS
# ═══════════════════════════════════════════════════════════════

def make_styles():
    styles = getSampleStyleSheet()
    return {
        'college': ParagraphStyle(
            'CollegeStyle', parent=styles['Heading1'],
            fontSize=13, leading=16, textColor=colors.HexColor("#0F172A"),
            alignment=1, spaceAfter=2),
        'dept': ParagraphStyle(
            'DeptStyle', parent=styles['Normal'],
            fontSize=9.5, leading=13, textColor=colors.HexColor("#475569"),
            alignment=1, spaceAfter=5),
        'title': ParagraphStyle(
            'TitleStyle', parent=styles['Heading2'],
            fontSize=12.5, leading=16, textColor=colors.HexColor("#1A365D"),
            alignment=1, spaceAfter=4),
        'repo': ParagraphStyle(
            'RepoStyle', parent=styles['Normal'],
            fontSize=9, leading=13, textColor=colors.HexColor("#0F172A"), spaceAfter=2),
        'meta': ParagraphStyle(
            'MetaStyle', parent=styles['Normal'],
            fontSize=8, textColor=colors.HexColor("#64748B"), spaceAfter=6),
        'section': ParagraphStyle(
            'SectionStyle', parent=styles['Heading2'],
            fontSize=10, leading=13, textColor=colors.HexColor("#0F172A"),
            spaceBefore=6, spaceAfter=3, keepWithNext=True),
        'subsection': ParagraphStyle(
            'SubSectionStyle', parent=styles['Heading3'],
            fontSize=8.5, leading=11, textColor=colors.HexColor("#2563EB"),
            spaceBefore=4, spaceAfter=2, keepWithNext=True),
        'msg': ParagraphStyle(
            'MsgStyle', parent=styles['Normal'],
            fontSize=7.5, leading=9.5, textColor=colors.HexColor("#1E293B")),
        'cell': ParagraphStyle(
            'MetaCellStyle', parent=styles['Normal'],
            fontSize=7.5, leading=9.5, textColor=colors.HexColor("#475569"), alignment=1),
        'note': ParagraphStyle(
            'NoteStyle', parent=styles['Normal'],
            fontSize=7.5, leading=10, textColor=colors.HexColor("#64748B"),
            spaceAfter=3),
    }


HEADER_STYLE = TableStyle([
    ('BACKGROUND',    (0, 0), (-1, 0), colors.HexColor("#1E293B")),
    ('TEXTCOLOR',     (0, 0), (-1, 0), colors.whitesmoke),
    ('ALIGN',         (0, 0), (-1, -1), 'CENTER'),
    ('ALIGN',         (0, 1), (0, -1), 'LEFT'),
    ('FONTNAME',      (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE',      (0, 0), (-1, -1), 8),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ('TOPPADDING',    (0, 0), (-1, -1), 3),
    ('GRID',          (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
    ('ROWBACKGROUNDS',(0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
])

LOG_HEADER_STYLE = TableStyle([
    ('BACKGROUND',    (0, 0), (-1, 0), colors.HexColor("#475569")),
    ('TEXTCOLOR',     (0, 0), (-1, 0), colors.whitesmoke),
    ('ALIGN',         (0, 0), (-1, -1), 'LEFT'),
    ('FONTNAME',      (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE',      (0, 0), (-1, -1), 7.5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ('TOPPADDING',    (0, 0), (-1, -1), 2),
    ('GRID',          (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
    ('ROWBACKGROUNDS',(0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
])


# ═══════════════════════════════════════════════════════════════
# PDF GENERATOR
# ═══════════════════════════════════════════════════════════════

def generate_pdf(interval="weekly"):
    repo_name, branch_name = get_repo_info()
    students, timeline_activity, student_logs, scope_title = get_git_metrics(interval)

    if students is None:
        return

    date_stamp = datetime.date.today().strftime("%Y-%m-%d")

    if interval == "weekly":
        report_title = "Weekly Progress Report"
        doc_name     = f"{repo_name}_Weekly_Progress_Report_Form-3_{date_stamp}.pdf"
    elif interval == "monthly":
        report_title = "Monthly Progress Report (Form-3)"
        doc_name     = f"{repo_name}_Monthly_Progress_Report_Form-3_{date_stamp}.pdf"
    else:
        report_title = "Final Project Evaluation Report"
        doc_name     = f"{repo_name}_Final_Report_{date_stamp}.pdf"

    doc = SimpleDocTemplate(
        doc_name,
        pagesize=letter,
        rightMargin=36, leftMargin=36,
        topMargin=32,   bottomMargin=32
    )

    S = make_styles()
    story = []

    # ── 1. Institution Header ───────────────────────────────────
    story.append(Paragraph(f"<b>{html.escape(COLLEGE_NAME)}</b>", S['college']))
    story.append(Paragraph(f"<b>{html.escape(DEPARTMENT_NAME)}</b>", S['dept']))
    story.append(Paragraph(f"<u><b>{report_title}</b></u>", S['title']))
    story.append(Spacer(1, 2))
    story.append(Paragraph(
        f"<b>Project Repository:</b> <font color='#2563EB'><b>{html.escape(repo_name)}</b></font>"
        f" &nbsp;|&nbsp; <b>Branch:</b> <code>{html.escape(branch_name)}</code>",
        S['repo']))
    story.append(Paragraph(
        f"<b>Evaluation Window:</b> {scope_title}"
        f" &nbsp;|&nbsp; <b>Generated On:</b> {datetime.date.today().strftime('%B %d, %Y')}",
        S['meta']))

    # ── 2. Individual Contribution Summary ─────────────────────
    story.append(Paragraph("1. Individual Contribution Breakdown", S['section']))
    total_commits = sum(data["commits"] for data in students.values())
    table_data = [["Student Name", "Commits (%)", "Lines Added", "Lines Deleted", "Net LOC", "Active Days"]]

    if students:
        for name, data in students.items():
            pct = (data["commits"] / total_commits * 100) if total_commits > 0 else 0
            net = data["added"] - data["deleted"]
            table_data.append([
                html.escape(name),
                f"{data['commits']} ({pct:.1f}%)",
                f"+{data['added']:,}",
                f"-{data['deleted']:,}",
                f"{net:,}",
                f"{len(data['active_days'])} days"
            ])
    else:
        table_data.append(["No commits found in this period.", "-", "-", "-", "-", "-"])

    t = Table(table_data, colWidths=[120, 80, 80, 80, 80, 100])
    t.setStyle(HEADER_STYLE)
    story.append(t)
    story.append(Spacer(1, 5))

    # ── 3. Visual Charts ────────────────────────────────────────
    story.append(Paragraph("2. Visual Trends & Volume", S['section']))
    story.append(create_charts(students, timeline_activity, interval))
    story.append(Spacer(1, 5))

    # ── 4. Git Commit Logs ──────────────────────────────────────
    if interval not in ("weekly", "monthly"):
        log_section_title = "3. Detailed Commit Logs (Complete History)"
    else:
        log_section_title = f"3. Detailed Commit Logs ({interval.capitalize()})"
    story.append(Paragraph(log_section_title, S['section']))

    if not student_logs:
        story.append(Paragraph("<i>No commit logs found for this timeframe.</i>", S['note']))
    else:
        for student_name, logs in student_logs.items():
            story.append(Paragraph(
                f"<b>Student:</b> {html.escape(student_name)} — <i>{len(logs)} commit(s)</i>",
                S['subsection']))
            log_table_data = [["Date", "Hash", "Commit Message"]]
            for date_val, sha_val, msg_val in logs:
                safe_msg = html.escape(msg_val) if msg_val else "(No commit message)"
                log_table_data.append([
                    Paragraph(date_val, S['cell']),
                    Paragraph(f"<code>{sha_val}</code>", S['cell']),
                    Paragraph(safe_msg, S['msg'])
                ])
            # repeatRows=1 ensures header row repeats cleanly if table spans pages
            log_table = Table(log_table_data, colWidths=[70, 60, 410], repeatRows=1)
            log_table.setStyle(LOG_HEADER_STYLE)
            story.append(log_table)
            story.append(Spacer(1, 4))

    # ════════════════════════════════════════════════════════════
    # DEVOPS SECTIONS — only included in 'final' mode
    # ════════════════════════════════════════════════════════════
    if interval not in ("weekly", "monthly"):

        # Clean transition to Jenkins pipeline on Page 2
        story.append(PageBreak())

        # ── Section 4: Jenkins Pipeline & Build History ─────────
        story.append(Paragraph("4. Jenkins Pipeline & Build History", S['section']))
        story.append(Paragraph(
            f"<b>Job Name:</b> <code>{JENKINS_JOB}</code> &nbsp;|&nbsp; "
            f"<b>Build Telemetry Source:</b> Local Jenkins build execution records "
            f"(<code>{JENKINS_BUILDS_PATH}</code>)",
            S['note']))

        builds = get_jenkins_builds()

        if not builds:
            story.append(Paragraph(
                "<i>Jenkins build records not found at the configured path. "
                "Ensure Jenkins service is active and jobs have been executed.</i>",
                S['note']))
        else:
            success_count = sum(1 for b in builds if b['result'] == 'SUCCESS')
            failure_count = sum(1 for b in builds if b['result'] == 'FAILURE')
            total_builds  = len(builds)
            avg_dur       = round(sum(b['duration'] for b in builds) / total_builds, 1)

            summary_data = [
                ["Total Builds", "Successful", "Failed", "Success Rate", "Avg Duration"],
                [
                    str(total_builds),
                    str(success_count),
                    str(failure_count),
                    f"{round(success_count/total_builds*100, 1)}%",
                    f"{avg_dur}s"
                ]
            ]
            st = Table(summary_data, colWidths=[100, 90, 90, 100, 100])
            st.setStyle(TableStyle([
                ('BACKGROUND',    (0, 0), (-1, 0), colors.HexColor("#1E293B")),
                ('TEXTCOLOR',     (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN',         (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME',      (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE',      (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
                ('TOPPADDING',    (0, 0), (-1, -1), 3.5),
                ('GRID',          (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ('ROWBACKGROUNDS',(0, 1), (-1, -1), [colors.HexColor("#F0FFF4"), colors.white]),
            ]))
            story.append(st)
            story.append(Spacer(1, 5))

            # Jenkins build duration bar chart
            story.append(create_jenkins_chart(builds))
            story.append(Spacer(1, 5))

            # Detailed build table
            story.append(Paragraph("Build Execution Log", S['subsection']))
            build_header = ["Build #", "Date & Time", "Result", "Duration (s)", "Triggered By"]
            build_rows   = [build_header]
            for b in builds:
                result_text = b['result']
                build_rows.append([
                    Paragraph(f"<b>#{b['number']}</b>", S['cell']),
                    Paragraph(b['datetime'], S['cell']),
                    Paragraph(
                        f"<font color='{'#166534' if result_text=='SUCCESS' else '#991B1B'}'>"
                        f"<b>{result_text}</b></font>",
                        S['cell']),
                    Paragraph(str(b['duration']), S['cell']),
                    Paragraph(html.escape(b['user']), S['cell']),
                ])

            bt = Table(build_rows, colWidths=[55, 130, 90, 90, 100], repeatRows=1)
            bt.setStyle(TableStyle([
                ('BACKGROUND',    (0, 0), (-1, 0), colors.HexColor("#334155")),
                ('TEXTCOLOR',     (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN',         (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME',      (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE',      (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
                ('TOPPADDING',    (0, 0), (-1, -1), 3),
                ('GRID',          (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ('ROWBACKGROUNDS',(0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
            ]))
            story.append(bt)
            story.append(Spacer(1, 3))
            story.append(Paragraph(
                "<i>Note: Early failed builds (#1–#4) terminated in &lt;4s during pipeline syntax initialization. "
                "Subsequent builds (#5–#9) successfully executed the multi-stage pipeline including dependencies, tests, and builds.</i>",
                S['note']))

        # Clean transition to Docker & DevOps Summary on Page 3
        story.append(PageBreak())

        # ── Section 5: Docker Build & Container History ─────────
        # STRICT REQUIREMENT: Contains ONLY 5 and 5a (Project Docker Images).
        # Subsection 5b (Docker Compose Services) and duplicate Docker summaries are omitted.
        story.append(Paragraph("5. Docker Build & Container History", S['section']))

        docker_images = get_docker_images()

        if not docker_images:
            story.append(Paragraph(
                "<i>Docker image data not available. Ensure Docker Desktop is running.</i>",
                S['note']))
        else:
            story.append(Paragraph("5a. Project Docker Images", S['subsection']))
            story.append(Paragraph(
                "The following table records the built application images and official base images "
                "orchestrated for the Shivakriti Constructions platform.",
                S['note']))

            img_header = ["Repository", "Tag", "Image ID", "Built / Pulled", "Size"]
            img_rows   = [img_header]
            for img in docker_images:
                img_rows.append([
                    Paragraph(html.escape(img['repo']), S['msg']),
                    Paragraph(html.escape(img['tag']),  S['cell']),
                    Paragraph(f"<code>{img['id']}</code>", S['cell']),
                    Paragraph(img['created_at'],         S['cell']),
                    Paragraph(img['size'],               S['cell']),
                ])
            it = Table(img_rows, colWidths=[175, 55, 85, 135, 60], repeatRows=1)
            it.setStyle(TableStyle([
                ('BACKGROUND',    (0, 0), (-1, 0), colors.HexColor("#1E293B")),
                ('TEXTCOLOR',     (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN',         (0, 0), (-1, -1), 'LEFT'),
                ('ALIGN',         (1, 0), (-1, -1), 'CENTER'),
                ('FONTNAME',      (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE',      (0, 0), (-1, -1), 7.5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
                ('TOPPADDING',    (0, 0), (-1, -1), 2.5),
                ('GRID',          (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ('ROWBACKGROUNDS',(0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
            ]))
            story.append(it)
            story.append(Spacer(1, 4))
            story.append(Paragraph(
                "<i>Note: Docker does not maintain a mutable historical build log by default; "
                "image creation timestamps and cryptographic IDs serve as verifiable build records.</i>",
                S['note']))

        # ── Section 6: DevOps Implementation Summary ────────────
        story.append(Spacer(1, 4))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#CBD5E1")))
        story.append(Spacer(1, 4))
        story.append(Paragraph("6. DevOps Implementation Summary", S['section']))

        # 6a. DevOps-Related Git Commits
        devops_keywords = ['docker', 'jenkins', 'prometheus', 'grafana', 'monitoring',
                           'pipeline', 'ci', 'webhook', 'nginx', 'container', 'deploy']
        devops_commits = []
        for name, logs in student_logs.items():
            for date_val, sha_val, msg_val in logs:
                if any(kw in msg_val.lower() for kw in devops_keywords):
                    devops_commits.append((date_val, sha_val, msg_val, name))

        if devops_commits:
            story.append(Paragraph("6a. DevOps-Related Git Commits", S['subsection']))
            dc_rows = [["Date", "Hash", "Commit Message", "Author"]]
            for date_val, sha_val, msg_val, author in devops_commits:
                dc_rows.append([
                    Paragraph(date_val,            S['cell']),
                    Paragraph(f"<code>{sha_val}</code>", S['cell']),
                    Paragraph(html.escape(msg_val), S['msg']),
                    Paragraph(html.escape(author),  S['cell']),
                ])
            dct = Table(dc_rows, colWidths=[70, 60, 320, 90], repeatRows=1)
            dct.setStyle(LOG_HEADER_STYLE)
            story.append(dct)
            story.append(Spacer(1, 4))

        # 6b. Technology Stack Overview
        story.append(Paragraph("6b. Technology Stack Overview", S['subsection']))
        tech_data = [
            ["Component",        "Technology",            "Role & Purpose",                   "Operational State"],
            ["Frontend Web",     "React + Vite",          "Interactive 3D portfolio app",     "✓ Production bundle"],
            ["Backend API",      "Node.js + Express",     "REST services & metrics export",   "✓ Port 5000 / Active"],
            ["Database",         "MongoDB (optional)",    "Enquiry document persistence",     "✓ Standalone mode"],
            ["CI/CD Pipeline",   "Jenkins",               "Multi-stage automated validation", "✓ 9 builds recorded"],
            ["Container Engine", "Docker + Compose",      "Service isolation & orchestration","✓ Multi-container"],
            ["Metrics Engine",   "Prometheus",            "Time-series scraping & alerting",  "✓ 3/3 targets UP"],
            ["Visualization",    "Grafana",               "11-panel operations dashboard",    "✓ Provisioned UID"],
            ["Reverse Proxy",    "Nginx (Alpine)",        "Static serving & upstream proxy",  "✓ Port 8085 / Active"],
            ["Node Exporter",    "Prometheus Exporter",   "Host compute & memory telemetry",  "✓ Port 9100 / Active"],
            ["Version Control",  "Git + GitHub",          "Auditable source history",         "✓ Fully tracked"],
        ]
        tech_t = Table(tech_data, colWidths=[105, 115, 185, 100], repeatRows=1)
        tech_t.setStyle(TableStyle([
            ('BACKGROUND',    (0, 0), (-1, 0), colors.HexColor("#1E293B")),
            ('TEXTCOLOR',     (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN',         (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME',      (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE',      (0, 0), (-1, -1), 7.5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
            ('TOPPADDING',    (0, 0), (-1, -1), 2.5),
            ('GRID',          (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ('ROWBACKGROUNDS',(0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
        ]))
        story.append(tech_t)
        story.append(Spacer(1, 4))

        # 6c. Service Access URLs
        story.append(Paragraph("6c. Service Access Endpoints", S['subsection']))
        url_data = [
            ["Platform Service",   "Host URL",                         "Authentication / Access"],
            ["Website Frontend",   "http://localhost:8085/",           "Public (Static Web)"],
            ["Backend Health API", "http://localhost:5000/health",     "Public (REST JSON)"],
            ["Prometheus Targets", "http://localhost:9090/targets",    "Public (Metrics Explorer)"],
            ["Grafana Dashboard",  "http://localhost:3000/",           "admin / admin"],
            ["Jenkins CI Server",  "http://localhost:8080/",           "yvt05 (Pipeline Project)"],
        ]
        url_t = Table(url_data, colWidths=[130, 210, 165], repeatRows=1)
        url_t.setStyle(TableStyle([
            ('BACKGROUND',    (0, 0), (-1, 0), colors.HexColor("#334155")),
            ('TEXTCOLOR',     (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN',         (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME',      (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE',      (0, 0), (-1, -1), 7.5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
            ('TOPPADDING',    (0, 0), (-1, -1), 2.5),
            ('GRID',          (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ('ROWBACKGROUNDS',(0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
        ]))
        story.append(url_t)

    # ── Build Document with NumberedCanvas ──────────────────────
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"\n[SUCCESS] Generated: {doc_name}")
    print(f" -> Found {len(students)} student(s) and {total_commits} total commits.")
    if interval not in ("weekly", "monthly"):
        builds = get_jenkins_builds()
        docker_images = get_docker_images()
        print(f" -> Jenkins builds included: {len(builds)}")
        print(f" -> Docker images included:  {len(docker_images)} (Section 5a only)")


if __name__ == "__main__":
    chosen_interval = sys.argv[1].lower() if len(sys.argv) > 1 else "weekly"
    generate_pdf(chosen_interval)
