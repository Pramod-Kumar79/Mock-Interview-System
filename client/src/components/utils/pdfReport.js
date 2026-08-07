import jsPDF from "jspdf";

// Strips the light markdown formatting used in AI review text (headers, bold
// markers, blockquote markers) down to plain text since jsPDF has no
// markdown renderer.
function stripMarkdown(text) {
  if (!text) return "";
  return text
    .replace(/^>\s?/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^#+\s*/gm, "")
    .replace(/`{1,3}([^`]*)`{1,3}/g, "$1");
}

export function downloadInterviewReport(interview, candidateName) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  const maxWidth = pageWidth - margin * 2;
  let y = 60;

  const addSpaceIfNeeded = (needed) => {
    if (y + needed > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = 60;
    }
  };

  doc.setFontSize(18);
  doc.setFont(undefined, "bold");
  doc.text("Mock Interview Report", margin, y);
  y += 26;

  doc.setFontSize(11);
  doc.setFont(undefined, "normal");
  if (candidateName) {
    doc.text(`Candidate: ${candidateName}`, margin, y);
    y += 16;
  }
  doc.text(`Job Role: ${interview.jobRole || "-"}`, margin, y);
  y += 16;
  doc.text(`Experience Level: ${interview.expLevel || "-"}`, margin, y);
  y += 16;
  doc.text(
    `Date: ${
      interview.createdAt ? new Date(interview.createdAt).toLocaleString() : "-"
    }`,
    margin,
    y,
  );
  y += 16;
  doc.text(
    `Overall Score: ${
      interview.score !== null && interview.score !== undefined
        ? interview.score
        : "--"
    } / 100`,
    margin,
    y,
  );
  y += 16;
  doc.text(
    `Suspicious Activity Detected: ${interview.suspiciousCount || 0} time(s)`,
    margin,
    y,
  );
  y += 26;

  if (
    interview.categoryScores &&
    Object.keys(interview.categoryScores).length > 0
  ) {
    doc.setFont(undefined, "bold");
    doc.text("Category Scores", margin, y);
    y += 18;
    doc.setFont(undefined, "normal");
    Object.entries(interview.categoryScores).forEach(([name, val]) => {
      addSpaceIfNeeded(16);
      doc.text(`- ${name}: ${val}/100`, margin + 10, y);
      y += 16;
    });
    y += 10;
  }

  if (interview.review) {
    addSpaceIfNeeded(24);
    doc.setFont(undefined, "bold");
    doc.text("AI Feedback", margin, y);
    y += 18;
    doc.setFont(undefined, "normal");
    const reviewLines = doc.splitTextToSize(
      stripMarkdown(interview.review),
      maxWidth,
    );
    reviewLines.forEach((line) => {
      addSpaceIfNeeded(14);
      doc.text(line, margin, y);
      y += 14;
    });
    y += 10;
  }

  if (interview.questions && interview.questions.length > 0) {
    addSpaceIfNeeded(24);
    doc.setFont(undefined, "bold");
    doc.text("Questions & Answers", margin, y);
    y += 18;

    interview.questions.forEach((q, idx) => {
      const answer =
        (interview.answers && interview.answers[idx]) || "No answer recorded";

      addSpaceIfNeeded(20);
      doc.setFont(undefined, "bold");
      const qLines = doc.splitTextToSize(`Q${idx + 1}. ${q}`, maxWidth);
      qLines.forEach((line) => {
        addSpaceIfNeeded(14);
        doc.text(line, margin, y);
        y += 14;
      });

      doc.setFont(undefined, "normal");
      const aLines = doc.splitTextToSize(answer, maxWidth);
      aLines.forEach((line) => {
        addSpaceIfNeeded(14);
        doc.text(line, margin, y);
        y += 14;
      });
      y += 10;
    });
  }

  const fileNameRole = (interview.jobRole || "interview").replace(
    /[^a-z0-9]+/gi,
    "_",
  );
  doc.save(`interview_report_${fileNameRole}_${interview.id}.pdf`);
}
