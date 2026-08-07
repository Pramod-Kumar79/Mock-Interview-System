from flask import g
import textwrap
import re

def to_markdown(text):
    text = text.replace('•', '  *')
    return textwrap.indent(text, '> ', predicate=lambda _: True)


CATEGORY_NAMES = ["Communication", "Technical Knowledge", "Confidence", "Problem Solving"]


def _fallback_score(suspiciousCount, ans):
    """Simple heuristic used only if the AI does not return a parsable score."""
    answered = sum(1 for a in (ans or []) if a and str(a).strip())
    total = len(ans) if ans else 1
    completeness = (answered / total) * 100

    score = completeness - (suspiciousCount * 5)
    return max(0, min(100, round(score)))


def _extract_score(raw_text, suspiciousCount, ans):
    """Look for a 'SCORE: NN' marker the model is asked to output; fall back to heuristic."""
    match = re.search(r'SCORE\s*[:\-]\s*(\d{1,3})', raw_text, re.IGNORECASE)
    if match:
        score = int(match.group(1))
        return max(0, min(100, score))
    return _fallback_score(suspiciousCount, ans)


def _extract_categories(raw_text, overall_score):
    """
    Looks for a 'CATEGORY_SCORES: Communication:NN, Technical Knowledge:NN, ...'
    line the model is asked to output. Falls back to using the overall score
    for every category if parsing fails, so the frontend always has values
    to render (e.g. in a radar/bar chart) instead of missing data.
    """
    categories = {}
    match = re.search(r'CATEGORY_SCORES\s*[:\-]\s*(.+)', raw_text, re.IGNORECASE)
    if match:
        pairs = match.group(1).split(',')
        for pair in pairs:
            if ':' not in pair:
                continue
            name, val = pair.rsplit(':', 1)
            name = name.strip()
            val = re.sub(r'[^\d]', '', val)
            if name and val:
                categories[name] = max(0, min(100, int(val)))

    if not categories:
        categories = {name: overall_score for name in CATEGORY_NAMES}

    return categories


def gen_review(job_role, qns, ans, emotion_analysis, suspiciousCount):
    # data = job_role + qns_ans + emotion analysis

    data = "Job Role: " + job_role
    # data += "Experience level: " + experience_lvl
    data += "Question & Answers:"

    for i in range(len(qns)):
        data += "\n Qtn " + str(i + 1) + ": " + qns[i] + "\n Ans: " + ans[i]

    data += "\nEmotion Analysis:\n" + str(emotion_analysis)
    data += "\nSuspicious Activity detected " + str(suspiciousCount) + " times while giving online mock interview."

    # print("\nData = ",data)

    msg = (
        f"Context = {data} \n"
        "The above context represents the data of an interviewee. "
        "Please write a 500-700 word review neatly for him/her, providing suggestions for areas of improvement based on the above context."
        "\nIMPORTANT : PLEASE FOLLOW THE BELOW RULES\n"
        "RULE 1: Write the review as if you are directly TALKING WITH HIM/HER."
        # "RULE 2: Be polite, but DONT use fake data or assumptions for review generation."
        "RULE 2: Don't write anything extra, only write the review."
        "RULE 3: Dont include any main headings such as 'review', use side-headings for explaining."
        "RULE 4: If emotion analysis data is present then USE that for review also."
        "RULE 5: This review is for an interview given in an website where anyone take mock interviews,"
        "so write review based on that, but dont tell hi,thank u and all."
        "RULE 6: Dont use/assume or write fake data which is not in context for review."
        "RULE 7: If suspicious activiyt is detected more than 3 times, "
        "then also tell how to ensure things such as cameras are working proper and not to change tabs in online interviews "
        "and also tell that the interviewers might assume it as malpractice"
        "\nRULE 8: On the second-to-last line of your response, on its own line, write EXACTLY in this format: "
        "'CATEGORY_SCORES: Communication:NN, Technical Knowledge:NN, Confidence:NN, Problem Solving:NN' "
        "where each NN is a whole number from 0 to 100 rating that specific aspect of the interviewee's performance."
        "\nRULE 9: On the very LAST line of your response, on its own line, write EXACTLY in this format: "
        "'SCORE: NN' where NN is a whole number from 0 to 100 representing this interviewee's overall "
        "interview performance (considering answer quality, relevance, confidence/emotion, and suspicious activity). "
        "This SCORE line must be the last line, with nothing after it."
    )

    # response = g.chat.send_message(msg)

    # call gemini
    response = g.model.generate_content([msg])
    raw_text = response.text

    score = _extract_score(raw_text, suspiciousCount, ans)
    categories = _extract_categories(raw_text, score)

    # Strip the SCORE and CATEGORY_SCORES marker lines out of the visible review text
    review_only_text = re.sub(r'\n?SCORE\s*[:\-]\s*\d{1,3}\s*$', '', raw_text.strip(), flags=re.IGNORECASE)
    review_only_text = re.sub(r'\n?CATEGORY_SCORES\s*[:\-].*$', '', review_only_text.strip(), flags=re.IGNORECASE)

    final_text = to_markdown(review_only_text)

    return final_text, score, categories