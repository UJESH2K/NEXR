# -*- coding: utf-8 -*-
"""Generates the NEXR image brief PDF for the external image supplier."""

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable,
)

OUT = r"C:\Users\aadit\OneDrive\Desktop\nexr\NEXR-Image-Brief.pdf"

INK = colors.HexColor("#141210")
BODY = colors.HexColor("#3a3531")
MUTED = colors.HexColor("#7c736c")
AMBER = colors.HexColor("#E06A00")
AMBER_SOFT = colors.HexColor("#FFF3E6")
RULE = colors.HexColor("#E2DCD5")
PANEL = colors.HexColor("#F7F4F0")

ss = getSampleStyleSheet()


def st(name, **kw):
    base = dict(fontName="Helvetica", fontSize=9.5, leading=14, textColor=BODY,
                alignment=TA_LEFT, spaceAfter=0)
    base.update(kw)
    return ParagraphStyle(name, **base)


S = {
    "cover_kicker": st("ck", fontName="Helvetica-Bold", fontSize=9, leading=13,
                       textColor=AMBER, spaceAfter=10),
    "cover_title": st("ct", fontName="Helvetica-Bold", fontSize=31, leading=36,
                      textColor=INK, spaceAfter=12),
    "cover_sub": st("cs", fontSize=12.5, leading=19, textColor=BODY, spaceAfter=8),
    "h1": st("h1", fontName="Helvetica-Bold", fontSize=19, leading=23,
             textColor=INK, spaceAfter=4),
    "h2": st("h2", fontName="Helvetica-Bold", fontSize=12, leading=16,
             textColor=INK, spaceAfter=5),
    "h3": st("h3", fontName="Helvetica-Bold", fontSize=9, leading=12,
             textColor=AMBER, spaceAfter=4),
    "p": st("p", spaceAfter=7),
    "p_small": st("ps", fontSize=8.6, leading=12.5, textColor=BODY),
    "lede": st("lede", fontSize=10.6, leading=15.5, textColor=INK, spaceAfter=7),
    "muted": st("mut", fontSize=8.5, leading=12, textColor=MUTED),
    "th": st("th", fontName="Helvetica-Bold", fontSize=8, leading=10,
             textColor=colors.white),
    "td": st("td", fontSize=8.4, leading=11.6),
    "td_b": st("tdb", fontName="Helvetica-Bold", fontSize=8.7, leading=12,
               textColor=INK),
    "td_mono": st("tdm", fontName="Courier-Bold", fontSize=8, leading=11,
                  textColor=AMBER),
    "num": st("num", fontName="Helvetica-Bold", fontSize=40, leading=42,
              textColor=colors.HexColor("#EFE8E0")),
    "num_sub": st("nums", fontName="Helvetica-Bold", fontSize=26, leading=30,
                  textColor=colors.HexColor("#EFE8E0")),
    "eyebrow": st("eb", fontName="Helvetica-Bold", fontSize=7.6, leading=10,
                  textColor=AMBER, spaceAfter=3),
}


# ---------------------------------------------------------------- page chrome
def on_page(canvas, doc):
    canvas.saveState()
    w, h = A4
    canvas.setStrokeColor(RULE)
    canvas.setLineWidth(0.5)
    canvas.line(18 * mm, h - 14 * mm, w - 18 * mm, h - 14 * mm)
    canvas.setFont("Helvetica", 7.2)
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, h - 11.5 * mm, "NEXR  \u2014  WEBSITE IMAGE BRIEF")
    canvas.drawRightString(w - 18 * mm, h - 11.5 * mm, "Page %d" % doc.page)
    canvas.line(18 * mm, 14 * mm, w - 18 * mm, 14 * mm)
    canvas.setFont("Helvetica", 7.2)
    canvas.drawString(18 * mm, 10 * mm, "Questions on any item in this document: hello@nexr.com")
    canvas.restoreState()


def on_cover(canvas, doc):
    canvas.saveState()
    w, h = A4
    canvas.setFillColor(AMBER)
    canvas.rect(0, h - 10 * mm, w, 10 * mm, stroke=0, fill=1)
    canvas.setFillColor(PANEL)
    canvas.rect(0, 0, w, 26 * mm, stroke=0, fill=1)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, 16 * mm,
                      "Prepared by NEXR for the appointed image supplier.")
    canvas.drawString(18 * mm, 11 * mm,
                      "Everything needed is in this document \u2014 no access to the "
                      "website is required.")
    canvas.restoreState()


# ---------------------------------------------------------------- components
def rule(space_before=3, space_after=7, color=RULE, width=0.7):
    return HRFlowable(width="100%", thickness=width, color=color,
                      spaceBefore=space_before, spaceAfter=space_after)


def section_header(num, name, page_says, needs):
    """Big numbered header block for each of the six sections."""
    left = [Paragraph(num, S["num"])]
    right = [
        Paragraph(name, S["h1"]),
        Spacer(1, 3),
        Paragraph(page_says, S["lede"]),
        Paragraph("<b>Images needed:</b> %s" % needs, S["p_small"]),
    ]
    t = Table([[left, right]], colWidths=[22 * mm, 152 * mm])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (0, 0), "TOP"),
        ("VALIGN", (1, 0), (1, 0), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ("LEFTPADDING", (0, 0), (0, 0), 0),
        ("LEFTPADDING", (1, 0), (1, 0), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
    ]))
    return t


def subpage_header(tag, name, page_says, needs):
    """Header for one of the three sub-pages inside Who It’s For."""
    left = [Paragraph(tag, S["num_sub"])]
    right = [
        Paragraph("SUB-PAGE OF SECTION 05 &nbsp;·&nbsp; WHO IT’S FOR", S["eyebrow"]),
        Paragraph(name, S["h1"]),
        Spacer(1, 3),
        Paragraph(page_says, S["lede"]),
        Paragraph("<b>Images needed:</b> %s" % needs, S["p_small"]),
    ]
    t = Table([[left, right]], colWidths=[22 * mm, 152 * mm])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, 0), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ("LEFTPADDING", (0, 0), (0, 0), 0),
        ("LEFTPADDING", (1, 0), (1, 0), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
    ]))
    return t


def image_table(rows):
    """rows: (ref, title, description, kind, shape, priority)"""
    head = [
        Paragraph("REF", S["th"]),
        Paragraph("WHAT WE NEED TO SEE IN THE PICTURE", S["th"]),
        Paragraph("TYPE", S["th"]),
        Paragraph("SHAPE", S["th"]),
        Paragraph("PRIORITY", S["th"]),
    ]
    data = [head]
    styles = [
        ("BACKGROUND", (0, 0), (-1, 0), INK),
        ("TOPPADDING", (0, 0), (-1, 0), 5),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 5),
        ("TOPPADDING", (0, 1), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 1), (-1, -1), 0.4, RULE),
        ("BOX", (0, 0), (-1, -1), 0.4, RULE),
    ]
    for i, (ref, title, desc, kind, shape, prio) in enumerate(rows, start=1):
        cell = [Paragraph(title, S["td_b"]), Spacer(1, 2),
                Paragraph(desc, S["td"])]
        data.append([
            Paragraph(ref, S["td_mono"]),
            cell,
            Paragraph(kind, S["td"]),
            Paragraph(shape, S["td"]),
            Paragraph(prio, S["td_b"] if prio.startswith("Must")
                      else S["td"]),
        ])
        if prio.startswith("Must"):
            styles.append(("BACKGROUND", (4, i), (4, i), AMBER_SOFT))
        if i % 2 == 0:
            styles.append(("BACKGROUND", (0, i), (3, i), colors.HexColor("#FBF9F7")))

    t = Table(data, colWidths=[15 * mm, 98 * mm, 22 * mm, 18 * mm, 21 * mm],
              repeatRows=1)
    t.setStyle(TableStyle(styles))
    return t


def avoid_box(text):
    p = Paragraph("<b>Please avoid in this section:</b> " + text, S["p_small"])
    t = Table([[p]], colWidths=[174 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PANEL),
        ("BOX", (0, 0), (-1, -1), 0.4, RULE),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return t


def two_col(left_title, left_items, right_title, right_items):
    def col(title, items, accent):
        flow = [Paragraph(title, S["h3"]), Spacer(1, 2)]
        for it in items:
            flow.append(Paragraph("\u2022&nbsp;&nbsp;" + it, S["p_small"]))
            flow.append(Spacer(1, 4))
        return flow
    t = Table([[col(left_title, left_items, AMBER),
                col(right_title, right_items, MUTED)]],
              colWidths=[86 * mm, 88 * mm])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (0, 0), 0),
        ("LEFTPADDING", (1, 0), (1, 0), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
    ]))
    return t


story = []
A = story.append

# =============================================================== COVER
A(Spacer(1, 34 * mm))
A(Paragraph("IMAGE BRIEF &nbsp;\u00b7&nbsp; VERSION 1 &nbsp;\u00b7&nbsp; SEPTEMBER 2026",
            S["cover_kicker"]))
A(Paragraph("What images we need<br/>for the NEXR website", S["cover_title"]))
A(rule(2, 12, AMBER, 2))
A(Paragraph(
    "The NEXR website is built from <b>six sections</b>. Each section has its own page, and each "
    "page has a lead image plus a small number of supporting images. Section 05 also has <b>three "
    "sub-pages of its own</b> — one for each setting we sell into — and those need "
    "images too.",
    S["cover_sub"]))
A(Paragraph(
    "This document lists every single image we need, section by section, and describes "
    "exactly what each one should show. You do not need to look at the website to use this. "
    "Just work down the list.",
    S["cover_sub"]))
A(Spacer(1, 10 * mm))

summary_rows = [
    ["01", "The Gap", "Why people hesitate to ask for help", "4", "6"],
    ["02", "Belief", "Wellbeing should adapt to the person", "4", "6"],
    ["03", "MeloWorld", "Our private, avatar-based virtual platform", "4", "6"],
    ["04", "VR Wellness", "Guided VR experiences for wellbeing", "4", "6"],
    ["05", "Who It’s For", "Workplaces, schools & colleges, healthcare", "4", "5"],
    ["05a", "Workplaces", "Sub-page — NEXR inside a workplace", "3", "4"],
    ["05b", "Schools & Colleges", "Sub-page — NEXR inside a school or college", "3", "4"],
    ["05c", "Healthcare", "Sub-page — NEXR in a practitioner’s practice", "3", "4"],
    ["06", "Let’s Talk", "Closing invitation to get in touch", "3", "4"],
]
data = [[Paragraph(x, S["th"]) for x in
         ["\u00a7", "SECTION", "WHAT THE PAGE IS ABOUT", "MINIMUM", "IDEAL"]]]
for r in summary_rows:
    data.append([
        Paragraph(r[0], S["td_mono"]),
        Paragraph(r[1], S["td_b"]),
        Paragraph(r[2], S["td"]),
        Paragraph(r[3], S["td"]),
        Paragraph(r[4], S["td_b"]),
    ])
data.append([
    Paragraph("", S["td"]),
    Paragraph("TOTAL", S["td_b"]),
    Paragraph("Across the whole website", S["td"]),
    Paragraph("32", S["td_b"]),
    Paragraph("45", S["td_b"]),
])
t = Table(data, colWidths=[12 * mm, 33 * mm, 89 * mm, 20 * mm, 20 * mm])
t.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), INK),
    ("BACKGROUND", (0, -1), (-1, -1), AMBER_SOFT),
    ("LINEABOVE", (0, -1), (-1, -1), 0.9, AMBER),
    ("TOPPADDING", (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("LINEBELOW", (0, 1), (-1, -2), 0.4, RULE),
    ("BOX", (0, 0), (-1, -1), 0.4, RULE),
]))
A(t)
A(Spacer(1, 6))
A(Paragraph(
    "<b>Minimum</b> is what we need for the page to work at all. <b>Ideal</b> is what we would "
    "like if budget and time allow \u2014 the page layout expands to use them. Please deliver the "
    "\u201cMust have\u201d items in full before starting on any \u201cNice to have\u201d item.",
    S["muted"]))

A(PageBreak())

# =============================================================== HOW TO USE
A(Paragraph("How to read this document", S["h1"]))
A(rule(4, 9, AMBER, 1.6))
A(Paragraph(
    "There is one page for each of the six sections, plus one for each of the three sub-pages "
    "inside section 05. Every one of those pages contains a table, and "
    "every row of that table is <b>one image we need</b>. The columns mean:",
    S["p"]))

meaning = [
    ("REF", "The code we will file the image under. Please use it in the filename you send back "
            "(see page 9)."),
    ("WHAT WE NEED TO SEE", "A short title, then a plain-English description of the picture. "
                            "Treat the description as the actual instruction \u2014 it is written "
                            "to be shot or rendered from directly."),
    ("TYPE", "<b>Photography</b> = real people, real places, camera. "
             "<b>3D render</b> = computer-generated environment or character. "
             "<b>Screen</b> = a capture or mock-up of our software interface, which we can supply "
             "source material for."),
    ("SHAPE", "The crop the website uses. <b>4:3</b> and <b>16:9</b> are landscape, <b>3:4</b> and "
              "<b>4:5</b> are portrait. Always shoot wider than the crop \u2014 see page 9."),
    ("PRIORITY", "<b>Must have</b> = the page cannot ship without it. "
                 "<b>Nice to have</b> = only if there is room in the budget."),
]
rows = [[Paragraph(k, S["td_b"]), Paragraph(v, S["td"])] for k, v in meaning]
t = Table(rows, colWidths=[42 * mm, 132 * mm])
t.setStyle(TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("TOPPADDING", (0, 0), (-1, -1), 5),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ("LEFTPADDING", (0, 0), (0, 0), 0),
    ("LINEBELOW", (0, 0), (-1, -2), 0.4, RULE),
]))
A(t)

A(Spacer(1, 8 * mm))
A(Paragraph("One thing to know before you start", S["h2"]))
A(Paragraph(
    "Every section also has a <b>lead image</b> \u2014 the large picture at the top of the page. "
    "It is the first row in each table, marked <b>\u2013 LEAD</b>. These six are the most important "
    "images in the whole set. If you only deliver six things, deliver those.",
    S["p"]))
A(Paragraph(
    "The six lead images are currently filled with temporary placeholders (screenshots of an old "
    "design). Everything in this brief replaces them.",
    S["p"]))

A(Spacer(1, 5 * mm))
A(Paragraph("The number of images can flex", S["h2"]))
A(Paragraph(
    "We have deliberately given a <b>minimum</b> and an <b>ideal</b> count per section rather than "
    "one fixed number. Some sections read better with three images, some with five. We will build "
    "the page layout around whatever you are able to deliver, so it is better to tell us early "
    "\u201cwe can do four here, not six\u201d than to stretch a shoot thin. What we cannot do is "
    "drop below the minimum \u2014 those pages would have visible gaps.",
    S["p"]))

A(PageBreak())

# =============================================================== HOUSE STYLE
A(Paragraph("House style \u2014 applies to every image", S["h1"]))
A(rule(4, 9, AMBER, 1.6))
A(Paragraph(
    "NEXR is a wellbeing technology company. The website sits on a <b>near-black background</b> "
    "with a single <b>warm amber accent</b> and off-white text. Images are placed onto that black "
    "and read as warm, quiet and grown-up. The overall feeling we are after is "
    "<b>calm, private and human</b> \u2014 never clinical, never corporate-stocky, never "
    "sci-fi.",
    S["p"]))

A(Spacer(1, 3 * mm))
A(two_col(
    "WE WANT",
    [
        "<b>Warm, low-key light.</b> Late afternoon, lamp light, window light. "
        "Shadows are fine and welcome.",
        "<b>Real, lived-in places.</b> Actual homes, actual offices, actual campuses \u2014 with "
        "clutter, texture and wear.",
        "<b>Quiet moments, not peak emotion.</b> People thinking, pausing, listening. "
        "Mid-action rather than posed.",
        "<b>Room to breathe.</b> Subjects placed off-centre with generous negative space, "
        "because text sits over these images.",
        "<b>A mix of people.</b> Different ages, ethnicities, body types and genders across the "
        "set, without making any one image feel like a diversity checklist.",
        "<b>Shallow depth of field</b> on people shots; deeper focus on environments.",
    ],
    "WE DO NOT WANT",
    [
        "<b>Stock-photo behaviour.</b> No thumbs-up, no high-fives, no laughing at a salad, "
        "no circle of colleagues clapping.",
        "<b>Clinical or medical cues.</b> No white coats, no clipboards, no hospital corridors, "
        "no therapy couch clich\u00e9.",
        "<b>Distress as a visual.</b> No head-in-hands, no crying, no person crumpled in a dark "
        "corner. We show hesitation, not suffering.",
        "<b>Sci-fi and cyberpunk.</b> No neon blue and purple, no glowing wireframes, no "
        "\u201cthe matrix\u201d. This is the single most common mistake with VR imagery.",
        "<b>Cold white studio backgrounds</b> or anything that reads as a product catalogue.",
        "<b>Readable personal data</b> on any screen, wall or badge. Privacy is our core promise.",
    ],
))

A(Spacer(1, 7 * mm))
A(Paragraph("Three technical habits that will save us a round of revisions", S["h2"]))

tech = [
    ("Leave the bottom third quiet",
     "Every image on the site has a dark gradient and a caption laid over its lower portion. "
     "Keep faces, hands and anything important <b>out of the bottom 25%</b> of the frame."),
    ("Colour will be shifted warm",
     "Images are tinted toward the site's amber palette and partly desaturated. Do not supply an "
     "image where a specific colour is doing the work \u2014 a blue logo, a green sign, a "
     "colour-coded chart will not survive. Composition and light must carry the image."),
    ("Shoot wider than the stated shape",
     "Each image is used at one shape on desktop and often a different one on mobile. Frame with "
     "at least 15% spare on all four sides so we can re-crop without cutting into the subject."),
]
rows = [[Paragraph("%d." % i, S["td_mono"]), Paragraph(k, S["td_b"]), Paragraph(v, S["td"])]
        for i, (k, v) in enumerate(tech, 1)]
t = Table(rows, colWidths=[8 * mm, 46 * mm, 120 * mm])
t.setStyle(TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("TOPPADDING", (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ("LEFTPADDING", (0, 0), (0, 0), 0),
    ("LINEBELOW", (0, 0), (-1, -2), 0.4, RULE),
]))
A(t)

A(PageBreak())

# =============================================================== SECTION 01
A(section_header(
    "01", "The Gap",
    "This page argues that support is more available than ever, but the <i>first step</i> still "
    "feels far away \u2014 that the distance is not between people and help, but between people "
    "and the way help is offered.",
    "<b>4 minimum, 6 ideal.</b> 1 lead + 3 must-have + 2 nice-to-have."))
A(rule(6, 8, AMBER, 1.6))
A(image_table([
    ("GAP-00",
     "\u2013 LEAD \u2014 The pause before reaching out",
     "One person alone in an ordinary domestic or workplace setting, phone or laptop in hand but "
     "not being used \u2014 held, forgotten, looked past. They are thinking, not upset. Evening or "
     "late-afternoon light from one side. Shot slightly wide so they sit small in the frame with "
     "the room around them. This is the single most important image on the page: it has to say "
     "\u201cI was about to, and then I didn't\u201d without a single sad face.",
     "Photography", "4:5<br/>portrait", "Must have"),
    ("GAP-01",
     "Help exists. Nobody is using it.",
     "A wellbeing noticeboard, helpline poster or support desk in a real corridor \u2014 office, "
     "campus or clinic \u2014 with people walking past it, blurred by motion. The support is "
     "clearly visible and clearly being ignored. Alternative version: a well-appointed, warmly-lit "
     "counselling room, door open, chairs empty, nobody in it.",
     "Photography", "4:3<br/>landscape", "Must have"),
    ("GAP-02",
     "Not everyone knows what they need",
     "A person at the very start of working something out \u2014 sitting on the edge of a bed, at "
     "a kitchen table early in the morning, or on a stairwell \u2014 mid-thought. Close-ish but "
     "not a tight portrait; we want to feel the room. Their face should be calm and unreadable "
     "rather than expressive.",
     "Photography", "4:3<br/>landscape", "Must have"),
    ("GAP-03",
     "The threshold",
     "A wide, architectural, almost empty frame: a person small in shot, paused at a doorway, at "
     "the top of a staircase, or halfway along a glass walkway. Read from behind or in profile "
     "\u2014 we do not need to see their face. This image carries a full-width headline, so the "
     "left half of the frame must stay visually quiet.",
     "Photography", "16:9<br/>wide", "Must have"),
    ("GAP-04",
     "A student, between everything",
     "A young adult sitting alone on campus steps, a library window seat or a bus, while the crowd "
     "moves past them out of focus. Same mood as GAP-02 but a clearly younger, education-setting "
     "cast.",
     "Photography", "3:4<br/>portrait", "Nice to have"),
    ("GAP-05",
     "The conversation that almost happens",
     "Two colleagues in an informal corner of a workplace \u2014 kitchen counter, stairwell, "
     "outside \u2014 in a real, slightly awkward, kind conversation. Coffee, not paperwork. One is "
     "listening properly. No manager-and-subordinate power staging.",
     "Photography", "4:3<br/>landscape", "Nice to have"),
]))
A(Spacer(1, 5))
A(avoid_box(
    "anything that illustrates mental ill-health directly \u2014 no silhouettes at windows, no "
    "rain on glass, no hands over faces, no grey-blue colour grade. The whole point of this "
    "section is that these people look completely ordinary."))

A(PageBreak())

# =============================================================== SECTION 02
A(section_header(
    "02", "Belief",
    "This page sets out what we believe: that people are different, so wellbeing should adapt to "
    "the person rather than asking every person to fit one model. It also carries our four "
    "principles \u2014 people first, privacy by design, more than one way in, purpose over novelty.",
    "<b>4 minimum, 6 ideal.</b> 1 lead + 3 must-have + 2 nice-to-have."))
A(rule(6, 8, AMBER, 1.6))
A(image_table([
    ("BEL-00",
     "– LEAD — Different people, different ways forward",
     "One frame containing several clearly different people who are visibly <i>not</i> doing the "
     "same thing — a shared but unstaged space (a co-working floor, a college common room, an "
     "apartment building seen through its windows at dusk) where three or four individuals each "
     "occupy their own pocket of it. It must read as <b>variety of people</b> at a glance. If one "
     "frame cannot do that, send four individual portraits shot identically instead — same light, "
     "same treatment, four very different people — and we will lay them out as a row.",
     "Photography", "4:5<br/>portrait", "Must have"),
    ("BEL-01",
     "Start with the person, not the problem",
     "A single person in <i>their own</i> environment, and the environment tells you who they are "
     "\u2014 a student's desk, a nurse's locker room, a parent's kitchen at 6am. They are settled "
     "and unhurried. We are illustrating the idea that context shapes need, so the surroundings "
     "matter as much as the person.",
     "Photography", "4:3<br/>landscape", "Must have"),
    ("BEL-02",
     "Privacy by design",
     "Someone using a device entirely privately \u2014 in bed, on a balcony, in a parked car, in a "
     "quiet corner \u2014 where the screen is clearly turned away, angled or too dim to read. The "
     "picture must communicate \u201cnobody else can see this\u201d. <b>Critical: no readable text "
     "or recognisable interface on the screen.</b>",
     "Photography", "4:3<br/>landscape", "Must have"),
    ("BEL-03",
     "Wellbeing as part of the everyday",
     "A wide, calm frame of an ordinary daily moment that is quietly also self-care: standing on a "
     "balcony with a coffee before the day starts, walking home with headphones, stretching in a "
     "doorway. Deliberately undramatic. This sits under a headline so keep the frame open.",
     "Photography", "16:9<br/>wide", "Must have"),
    ("BEL-04",
     "More than one way in",
     "A literal illustration of choice: a person holding a tablet or phone showing several "
     "different routes forward (we will supply the interface mock-up to place on the screen if "
     "you shoot a blank-screen plate). Alternatively an environmental metaphor \u2014 several "
     "doors, several paths \u2014 but only if it can be done without looking like a stock "
     "metaphor.",
     "Photography<br/>+ Screen", "4:3<br/>landscape", "Nice to have"),
    ("BEL-05",
     "Practitioner and person",
     "A warm, informal conversation between a mental-health professional and someone they are "
     "supporting. Two chairs, soft furnishings, daylight. It must look like a room someone chose, "
     "not a room they were sent to. No desk between them, no notes visible, no white walls.",
     "Photography", "3:4<br/>portrait", "Nice to have"),
]))
A(Spacer(1, 5))
A(avoid_box(
    "lightbulbs, jigsaw pieces, compasses, sunrises, cupped hands and any other visual metaphor "
    "for \u201cinsight\u201d or \u201csupport\u201d. Also avoid images where one person is "
    "visibly the helper and one is visibly the helped."))

A(PageBreak())

# =============================================================== SECTION 03
A(section_header(
    "03", "MeloWorld",
    "MeloWorld is our product: a private virtual space people enter as an <b>avatar</b>, with no "
    "photo and no public profile. They explore at their own pace and can connect with a qualified "
    "professional inside the platform when they choose to. Anonymity is the entire promise.",
    "<b>4 minimum, 6 ideal.</b> 1 lead + 3 must-have + 2 nice-to-have."))
A(rule(6, 8, AMBER, 1.6))
A(Paragraph(
    "<b>Note on this section:</b> most of these are computer-generated rather than photographed. "
    "We can supply reference material, brand assets and a style frame on request \u2014 please ask "
    "before starting any render.", S["p_small"]))
A(Spacer(1, 5))
A(image_table([
    ("MEL-00",
     "\u2013 LEAD \u2014 The world itself",
     "A wide establishing render of the MeloWorld environment: a calm, architecturally considered "
     "virtual space with warm light, soft materials, water or planting, and a sense of openness. "
     "It should feel like somewhere you would want to sit down \u2014 closer to a quiet pavilion "
     "or a garden courtyard than to a lobby, a clinic or a game level. One or two stylised avatars "
     "may be present in the distance for scale.",
     "3D render", "4:5<br/>portrait", "Must have"),
    ("MEL-01",
     "Your avatar",
     "A single stylised avatar, shown either standing in the environment or on a "
     "selection/customisation screen. The avatar must be clearly <b>non-photoreal and not "
     "identifiable as any real person</b> \u2014 that is the product's point. Stylised, warm, "
     "appealing; not cartoonish, not uncanny, not a game character with armour and weapons.",
     "3D render", "3:4<br/>portrait", "Must have"),
    ("MEL-02",
     "A session in the space",
     "Two avatars seated across from each other in a small, enclosed, private part of the "
     "environment \u2014 one is the person, one is the professional. Light suggests intimacy and "
     "safety. The composition should read unmistakably as <b>a conversation</b> without either "
     "figure having a real face or a nameplate.",
     "3D render", "4:3<br/>landscape", "Must have"),
    ("MEL-03",
     "Entering from the real world",
     "A photograph bridging real life and the platform: a person at home on a sofa or at a desk, "
     "laptop or tablet in front of them, MeloWorld visible on the screen (shoot a clean plate and "
     "we will composite). Ordinary room, warm evening light, relaxed posture — someone entirely at "
     "ease.",
     "Photography<br/>+ Screen", "16:9<br/>wide", "Must have"),
    ("MEL-04",
     "Moving through the space",
     "A second environment render showing a <i>different</i> area of MeloWorld, so the two "
     "together prove the space has variety \u2014 for example an open outdoor-feeling area if "
     "MEL-00 is enclosed, or a quiet indoor alcove if MEL-00 is open. Same world, same materials, "
     "same light language.",
     "3D render", "4:3<br/>landscape", "Nice to have"),
    ("MEL-05",
     "What the organisation sees",
     "A clean mock-up of the engagement dashboard an employer or institution would see: "
     "<b>aggregate numbers only — no names, no faces, no individual records in frame.</b> Dark "
     "interface, amber accent, generous spacing. On a laptop, or as a flat screen graphic. We will "
     "supply the data.",
     "Screen", "16:9<br/>wide", "Nice to have"),
]))
A(Spacer(1, 5))
A(avoid_box(
    "anything that makes the platform look like a video game or a metaverse land-grab \u2014 no "
    "floating islands, no hexagonal grids, no purple-and-cyan gradients, no crowds of avatars, no "
    "leaderboards or HUD overlays. And never show an avatar next to a real name."))

A(PageBreak())

# =============================================================== SECTION 04
A(section_header(
    "04", "VR Wellness",
    "Our second product: guided virtual experiences built for specific goals — relaxation, "
    "emotional regulation, confidence in social situations, gradual work on fears, and learning. "
    "We call it “a rehearsal space for real life”. Practitioners stay involved in how it is used.",
    "<b>4 minimum, 6 ideal.</b> 1 lead + 3 must-have + 2 nice-to-have."))
A(rule(6, 8, AMBER, 1.6))
A(Paragraph(
    "<b>Read this before shooting for this section.</b> Most VR imagery in the world is wrong for "
    "us: no close-up of a face in a headset, no person alone in a dark room grabbing at glowing "
    "shapes. We want VR shown as an <b>ordinary, social, domestic thing</b> — a real living room, "
    "daylight, sofa, rug, mug on the table, other people relaxed nearby.",
    S["p_small"]))
A(Spacer(1, 5))
A(image_table([
    ("VRW-00",
     "\u2013 LEAD \u2014 VR at home, among people",
     "<b>The most specific request in this brief.</b> A real living room, natural daylight, two or "
     "three people of different ages sharing the space. One wears a VR headset, seated or "
     "standing, mid-experience and relaxed — hands low, shoulders down, not flailing. The others "
     "are <b>present and comfortable</b>: one on the sofa with a book, glancing over; another "
     "passing through with a mug. Lived-in and unstyled. Shot wide from across the room so you "
     "read the whole social setting at once: <i>this belongs in a home, around other people, and "
     "nobody finds it strange.</i>",
     "Photography", "4:5<br/>portrait", "Must have"),
    ("VRW-01",
     "Inside the experience",
     "A render of what the person actually sees in the headset: a calm, purposeful environment — a "
     "shoreline at low light, a forest clearing, a still room with a long view. It must read as a "
     "<b>wellbeing environment</b>, not a game level and not a screensaver. No interface, no "
     "floating menus, no hands or controllers in frame.",
     "3D render", "16:9<br/>wide", "Must have"),
    ("VRW-02",
     "A guided session with a professional",
     "A mental-health professional seated <i>beside</i> a person wearing a headset, in a warm "
     "consultation room — soft chairs, lamp, plant, daylight. Attentive, perhaps holding a "
     "tablet, clearly guiding rather than observing an experiment. Expertise stays in the loop, so "
     "the two must read as working <b>together</b>.",
     "Photography", "4:3<br/>landscape", "Must have"),
    ("VRW-03",
     "Practising a real situation",
     "A first-person render of a scenario someone would rehearse: standing at the front of a "
     "meeting room with people seated and looking up, stepping into a lift, or approaching a small "
     "group at a social event. Rendered at the user&#39;s own eye level. Figures stylised in the "
     "same language as the MeloWorld avatars, not photoreal.",
     "3D render", "4:3<br/>landscape", "Must have"),
    ("VRW-04",
     "Second social setting, not a home",
     "The same idea as VRW-00 but in a workplace or campus wellbeing room: two or three people, "
     "one in a headset, others nearby and at ease, daylight, soft furnishings. A non-domestic "
     "version of the same message, for our organisational pages.",
     "Photography", "4:3<br/>landscape", "Nice to have"),
    ("VRW-05",
     "The headset, at rest",
     "A quiet still life: the headset on a side table, shelf or windowsill in a warm domestic or "
     "office setting, beside ordinary objects — a book, a mug, a plant. Available light, shallow "
     "focus, no black backdrop, no studio sweep. An object that lives in the house.",
     "Photography", "3:4<br/>portrait", "Nice to have"),
]))
A(Spacer(1, 5))
A(avoid_box(
    "close-up faces in headsets; people alone in dark rooms; hands grabbing at glowing blue "
    "particles; neon, wireframes or “digital” overlays; anyone looking amazed or comedic; gaming "
    "chairs, RGB lighting, esports setups. If it would work as an advert for a games console, it "
    "is wrong for us."))

A(PageBreak())

# =============================================================== SECTION 05
A(section_header(
    "05", "Who It’s For",
    "This page shows the three settings NEXR is built for: <b>workplaces</b>, <b>schools & "
    "colleges</b>, and <b>healthcare</b>. The three appear side by side as a row of equal tiles.",
    "<b>4 minimum, 5 ideal.</b> 1 lead + 3 must-have + 1 nice-to-have."))
A(rule(6, 8, AMBER, 1.6))
A(Paragraph(
    "<b>Important:</b> WHO-01, WHO-02 and WHO-03 sit next to each other on screen as three equal "
    "tiles. They must be shot as a <b>matched set</b> \u2014 same lens character, same height of "
    "camera, same light quality, same grade, same amount of breathing space. If one is a wide daylight "
    "frame and another is a tight lamp-lit one, the row falls apart.",
    S["p_small"]))
A(Spacer(1, 5))
A(image_table([
    ("WHO-00",
     "\u2013 LEAD \u2014 Designed for people, built for organisations",
     "A single frame that reads as \u201can everyday institutional space, with real people in "
     "it\u201d \u2014 a modern building's shared floor, atrium or long corridor with daylight and "
     "a handful of people going about their day. It should not obviously be an office, a school "
     "<i>or</i> a hospital; it should feel like it could host any of them. People small in frame, "
     "architecture doing the work.",
     "Photography", "4:5<br/>portrait", "Must have"),
    ("WHO-01",
     "Workplaces",
     "A real, contemporary, un-corporate workplace: warm materials, plants, natural light, a small "
     "group of people working or talking normally. Mixed ages and roles. No glass-tower boardroom, "
     "no suits, no stock \u201cteam meeting\u201d staging.",
     "Photography", "4:3<br/>landscape", "Must have"),
    ("WHO-02",
     "Schools & colleges",
     "Students aged roughly 16\u201322 in a campus setting \u2014 a common room, library, step or "
     "courtyard. Relaxed, mid-conversation or mid-work, unposed. It must clearly read as education "
     "without reading as a prospectus cover.",
     "Photography", "4:3<br/>landscape", "Must have"),
    ("WHO-03",
     "Healthcare",
     "A mental-health professional's own consulting room, warm and domestic in feel \u2014 soft "
     "chairs, lamp, books, daylight \u2014 either with a practitioner present or quietly empty and "
     "ready. <b>Deliberately not medical:</b> no white coat, no examination bed, no hospital "
     "corridor, no equipment.",
     "Photography", "16:9<br/>wide", "Must have"),
    ("WHO-04",
     "Bringing it in",
     "An onboarding or walkthrough moment inside one of the three settings: a small group standing "
     "around a screen or a headset while someone shows them how it works. Practical, unglamorous, "
     "real.",
     "Photography", "4:3<br/>landscape", "Nice to have"),
]))
A(Spacer(1, 5))
A(avoid_box(
    "any suggestion of surveillance or assessment \u2014 no one looking over a shoulder at a "
    "screen, no clipboards, no one-to-one across a desk. Also avoid children under about 16 "
    "entirely."))

A(Spacer(1, 6))
A(Paragraph(
    "<b>Each of these three settings also has its own sub-page on the website</b>, and each needs "
    "a further three images — the next three pages of this document. WHO-01, WHO-02 and "
    "WHO-03 above are the <i>tiles</i> that link to them, so the sub-page images must be "
    "different frames, not the same picture used twice.",
    S["p_small"]))

A(PageBreak())

# ======================================================= SUB-PAGE 05a
A(subpage_header(
    "05a", "Workplaces",
    "The sub-page an employer lands on. Its promise: create more approachable ways for employees "
    "to explore wellbeing, build healthier habits and access professional support.",
    "<b>3 minimum, 4 ideal.</b> 1 lead + 2 must-have + 1 nice-to-have."))
A(rule(6, 8, AMBER, 1.6))
A(Paragraph(
    "<b>Applies to all three sub-pages (05a, 05b, 05c).</b> These nine images are the proof that "
    "NEXR works in a real building, so they should be shot on location rather than staged in a "
    "studio. <b>NEXR can arrange access to partner sites</b> — an office, a college, a "
    "practitioner’s practice — and can bring VR hardware to the shoot. Tell us which of "
    "the three you want to shoot on location and we will coordinate the day. Shoot all three sets "
    "with the same lens, light and grade so the three sub-pages read as one family.",
    S["p_small"]))
A(Spacer(1, 5))
A(image_table([
    ("WPL-00",
     "– LEAD — Wellbeing built into the workplace",
     "A modern workplace where wellbeing is visibly part of the building rather than bolted onto "
     "it: a bookable quiet room, a soft-seating corner off the main floor, or a booth by a window, "
     "with one person using it normally. Warm materials, plants, daylight, real desks visible "
     "beyond. Shot wide, so you read the room and its place in the office at once.",
     "Photography", "4:5<br/>portrait", "Must have"),
    ("WPL-01",
     "A private moment, on a working day",
     "An employee using the platform during the working day — laptop or headset in a quiet "
     "room, door closed, blinds half-drawn, mid-afternoon light. Jacket on the chair, lanyard on "
     "the table. The point is that this happened <b>at work, on work time, and nobody made a thing "
     "of it</b>. Calm and matter-of-fact, never furtive.",
     "Photography", "4:3<br/>landscape", "Must have"),
    ("WPL-02",
     "A session for a small team",
     "Three or four colleagues in a relaxed circle in a soft-seating area, one of them leading. "
     "Mixed ages and roles, mid-conversation. A headset may sit unused on the table. <b>Not</b> a "
     "training room, not a presentation, no screen at the front of the room.",
     "Photography", "4:3<br/>landscape", "Must have"),
    ("WPL-03",
     "Handing it over",
     "An HR or people-team lead showing the platform on a screen to a colleague at a desk. "
     "Practical and unglamorous — this is the rollout, not the brochure. Screen content does "
     "not need to be legible.",
     "Photography", "16:9<br/>wide", "Nice to have"),
]))
A(Spacer(1, 5))
A(avoid_box(
    "glass-tower boardrooms, suits, breakout rooms that look like a furniture catalogue, and any "
    "frame where a manager is visibly watching an employee use the product."))

A(PageBreak())

# ======================================================= SUB-PAGE 05b
A(subpage_header(
    "05b", "Schools &amp; Colleges",
    "The sub-page a school or college lands on. Its promise: give students safe, engaging ways to "
    "understand their wellbeing, build emotional skills and access support when they need it.",
    "<b>3 minimum, 4 ideal.</b> 1 lead + 2 must-have + 1 nice-to-have."))
A(rule(6, 8, AMBER, 1.6))
A(Paragraph(
    "<b>Cast note:</b> students should read as <b>16 to 22</b>. We do not use images of children "
    "below that age anywhere on the site. Every student in frame needs a signed release, and where "
    "anyone is under 18 that release must come from a parent or guardian — please confirm "
    "this is in hand before the shoot day rather than on delivery.",
    S["p_small"]))
A(Spacer(1, 5))
A(image_table([
    ("EDU-00",
     "– LEAD — A student wellbeing space, in use",
     "A wellbeing or quiet space inside a real school or college — a common room, a study "
     "corner, a pastoral room — with students using it normally. Daylight, worn furniture, "
     "real noticeboards, a bag on the floor. One student is on a laptop or in a headset; the "
     "others are simply around and entirely unbothered by it. Shot wide.",
     "Photography", "4:5<br/>portrait", "Must have"),
    ("EDU-01",
     "Between classes",
     "One student using the platform privately — a library booth, a quiet stairwell corner, "
     "or a room in halls. Bag down, headphones or headset on, ten minutes to themselves. "
     "Undramatic: this is a normal part of their day, not a crisis.",
     "Photography", "4:3<br/>landscape", "Must have"),
    ("EDU-02",
     "A guided group, with staff alongside",
     "A counsellor or pastoral lead with three or four students, seated informally in a circle. "
     "The adult is <b>alongside the group, not in front of it</b>. No rows of desks, no "
     "whiteboard, no assembly staging. Warm, ordinary, mid-conversation.",
     "Photography", "4:3<br/>landscape", "Must have"),
    ("EDU-03",
     "The campus itself",
     "A wide establishing frame of a real school or college in use — a corridor, a courtyard, "
     "steps between lessons — with students moving through it. Gives the page a sense of "
     "place. People can be small in frame or motion-blurred.",
     "Photography", "16:9<br/>wide", "Nice to have"),
]))
A(Spacer(1, 5))
A(avoid_box(
    "anything that reads as a prospectus cover — no posed groups on the lawn, no laughing "
    "into a laptop, no branded hoodies. Also avoid any frame where a student appears to be "
    "monitored, tested or singled out."))

A(PageBreak())

# ======================================================= SUB-PAGE 05c
A(subpage_header(
    "05c", "Healthcare",
    "The sub-page a mental health professional or practice lands on. Its promise: extend the "
    "toolkit available to practitioners with immersive environments and digital experiences that "
    "complement existing care.",
    "<b>3 minimum, 4 ideal.</b> 1 lead + 2 must-have + 1 nice-to-have."))
A(rule(6, 8, AMBER, 1.6))
A(Paragraph(
    "<b>Do not repeat VRW-02.</b> Section 04 already has a practitioner-and-headset image on the "
    "same site. Use a different room, different cast and a different angle here, or the two pages "
    "will look like the same shoot twice. VRW-02 is about <i>the product</i>; these are about "
    "<i>the practice</i> — the professional’s own room and their own way of working.",
    S["p_small"]))
A(Spacer(1, 5))
A(image_table([
    ("HCR-00",
     "– LEAD — A practice room, set up and ready",
     "A mental health professional’s own consulting room prepared for a session: two "
     "comfortable chairs angled towards each other, a headset resting on a side table, a tablet, a "
     "lamp, books, a plant, daylight through a window. <b>Deliberately domestic, deliberately not "
     "medical.</b> Quietly empty and waiting, or with the practitioner present.",
     "Photography", "4:5<br/>portrait", "Must have"),
    ("HCR-01",
     "A session, guided",
     "The practitioner seated beside a client wearing a headset, tablet in hand, attentive and "
     "adjusting the experience as it runs. Read from across the room rather than over anyone’s "
     "shoulder; the client’s face need not be identifiable. Lamp and window light, no "
     "overheads. Must read as <b>two people working together</b>.",
     "Photography", "4:3<br/>landscape", "Must have"),
    ("HCR-02",
     "The professional, between clients",
     "The practitioner alone in their room — preparing an experience on a tablet, making a "
     "note, or sitting with a coffee before the next session. Thoughtful and competent, a person "
     "rather than a role. <b>No white coat, no stethoscope, no badge, no clipboard.</b>",
     "Photography", "3:4<br/>portrait", "Must have"),
    ("HCR-03",
     "Two practitioners",
     "An informal supervision or handover moment between two professionals in the same warm "
     "setting — standing by a window, or either side of a low table. Signals that this sits "
     "inside proper clinical practice rather than replacing it.",
     "Photography", "16:9<br/>wide", "Nice to have"),
]))
A(Spacer(1, 5))
A(avoid_box(
    "hospital corridors, examination beds, scrubs, white walls and any equipment that reads as "
    "medical. Avoid the therapy-couch cliché entirely — nobody lying down, nobody taking "
    "notes from behind a desk."))

A(PageBreak())

# =============================================================== SECTION 06
A(section_header(
    "06", "Let’s Talk",
    "The closing section of every page: an invitation to book a demo and start a conversation. "
    "Warm, open, human \u2014 the visual equivalent of an open door.",
    "<b>3 minimum, 4 ideal.</b> 1 lead + 2 must-have + 1 nice-to-have."))
A(rule(6, 8, AMBER, 1.6))
A(image_table([
    ("CTA-00",
     "\u2013 LEAD \u2014 An open door",
     "Warm, welcoming, and genuinely about arrival: a person holding a door or standing in a "
     "lit doorway; or a sunlit reception area with someone rising to greet a visitor just out of "
     "frame. Amber-toned light, generous space, nothing to decode. This image ends every page, so "
     "it needs to leave the reader feeling invited rather than sold to.",
     "Photography", "4:5<br/>portrait", "Must have"),
    ("CTA-01",
     "Book a demo",
     "A walkthrough in progress: one person showing two or three others the platform on a large "
     "screen or a laptop in a meeting room. Everyone is engaged and leaning in; the screen content "
     "does not need to be legible (we will composite it if it is). Natural, mid-conversation, not "
     "a presentation set-piece.",
     "Photography", "4:3<br/>landscape", "Must have"),
    ("CTA-02",
     "Connect with us",
     "A wide, calm frame of the working environment \u2014 a studio or office with warm light, "
     "a few people at work, plenty of empty space in the left or right third for a headline and "
     "a button to sit over. Quiet and confident rather than busy.",
     "Photography", "16:9<br/>wide", "Must have"),
    ("CTA-03",
     "The team",
     "An informal group portrait of the NEXR team, or a candid of two or three people working "
     "together. Real setting, available light, no white background and no arms-folded line-up. "
     "<b>Requires NEXR to arrange the people and location \u2014 please coordinate with us before "
     "scheduling.</b>",
     "Photography", "4:3<br/>landscape", "Nice to have"),
]))
A(Spacer(1, 5))
A(avoid_box(
    "handshakes, contracts being signed, headsets, \u201ccustomer service\u201d telephone "
    "headsets, and anything that reads as a sales close."))

A(PageBreak())

# =============================================================== DELIVERY
A(Paragraph("How to deliver the files", S["h1"]))
A(rule(4, 9, AMBER, 1.6))

A(Paragraph("File format and size", S["h2"]))
spec = [
    ("Format", "JPEG (quality 90+), PNG or TIFF. Do <b>not</b> send WebP, HEIC or PDF \u2014 we "
               "convert to web formats ourselves."),
    ("Resolution", "At least <b>2400 pixels on the long edge</b>. More is welcome; we have "
                   "full-bleed uses. 3D renders: 3000px on the long edge minimum."),
    ("Colour", "sRGB, embedded profile. Please do not apply a heavy creative grade \u2014 deliver "
               "close to neutral and we will apply the site's warm treatment."),
    ("Crops", "Send <b>two versions of each image</b>: (1) cropped to the shape listed in the "
              "table, and (2) the full uncropped master. The master is what lets us re-crop for "
              "mobile without coming back to you."),
    ("Retouching", "Light clean-up only. No skin smoothing, no sky replacement, no added lens "
                   "flare, no composited-in devices unless we agreed it."),
    ("Rights", "We need <b>worldwide, perpetual, unlimited web and print usage</b>, including "
               "paid social and print collateral. Please confirm model and property releases are "
               "in place for every recognisable person and location."),
]
rows = [[Paragraph(k, S["td_b"]), Paragraph(v, S["td"])] for k, v in spec]
t = Table(rows, colWidths=[30 * mm, 144 * mm])
t.setStyle(TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("TOPPADDING", (0, 0), (-1, -1), 5),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ("LEFTPADDING", (0, 0), (0, 0), 0),
    ("LINEBELOW", (0, 0), (-1, -2), 0.4, RULE),
]))
A(t)

A(Spacer(1, 7 * mm))
A(Paragraph("Naming", S["h2"]))
A(Paragraph(
    "Use the <b>REF code</b> from the tables, lower case, followed by a short description and the "
    "crop. This matters more than it looks \u2014 it is how the files get placed on the site "
    "without anyone having to open them:",
    S["p"]))
example = [
    ["vrw-00_home-social_4x5.jpg", "Cropped, ready to place"],
    ["vrw-00_home-social_master.jpg", "Full uncropped frame"],
    ["mel-02_session_4x3.png", "Cropped render"],
    ["who-01_workplace_4x3.jpg", "Cropped, ready to place"],
]
rows = [[Paragraph(a, S["td_mono"]), Paragraph(b, S["td"])] for a, b in example]
t = Table(rows, colWidths=[72 * mm, 102 * mm])
t.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), PANEL),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("TOPPADDING", (0, 0), (-1, -1), 4),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ("BOX", (0, 0), (-1, -1), 0.4, RULE),
    ("LINEBELOW", (0, 0), (-1, -2), 0.4, colors.white),
]))
A(t)

A(Spacer(1, 7 * mm))
A(Paragraph("Please come back to us on these before you start", S["h2"]))
qs = [
    "<b>Cast and locations.</b> Confirm with us which markets the cast should reflect, and send "
    "casting and location options for approval before any shoot date is locked.",
    "<b>Anything rendered.</b> Send a single style frame for MeloWorld (MEL-00) and one for VR "
    "Wellness (VRW-01) and get them signed off before building the rest. The look of those two "
    "sets the look of both products.",
    "<b>Anything with a screen in it.</b> Tell us in advance and we will supply the interface "
    "artwork, or shoot a clean plate and we will composite.",
    "<b>Counts.</b> If a section's ideal count is not achievable, tell us which images you are "
    "dropping so we can adjust the page layout rather than leaving a hole in it.",
]
for i, q in enumerate(qs, 1):
    A(Paragraph("<b>%d.</b>&nbsp;&nbsp;%s" % (i, q), S["p_small"]))
    A(Spacer(1, 5))

A(Spacer(1, 6 * mm))
A(rule(0, 6, AMBER, 1.6))
A(Paragraph(
    "<b>In one line:</b> 32 images to make the site work, 45 to make it sing. Six of them "
    "(the LEAD images) matter more than the rest. If in doubt on any frame, choose the warmer, "
    "quieter, more ordinary version of it.",
    S["lede"]))

# ---------------------------------------------------------------- build
doc = BaseDocTemplate(OUT, pagesize=A4,
                      leftMargin=18 * mm, rightMargin=18 * mm,
                      topMargin=20 * mm, bottomMargin=20 * mm,
                      title="NEXR \u2014 Website Image Brief",
                      author="NEXR",
                      subject="Image requirements for the NEXR website, by section")
frame = Frame(18 * mm, 18 * mm, A4[0] - 36 * mm, A4[1] - 38 * mm, id="body",
              leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
doc.addPageTemplates([
    PageTemplate(id="cover", frames=[frame], onPage=on_cover),
    PageTemplate(id="body", frames=[frame], onPage=on_page),
])

# first page uses the cover template, everything after uses body
from reportlab.platypus import NextPageTemplate
story.insert(0, NextPageTemplate("body"))

doc.build(story)
print("written:", OUT)
