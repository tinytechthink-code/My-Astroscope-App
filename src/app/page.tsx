"use client";
import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  interface MatchRequest {
    groom: string;
    bride: string;
    groomDOB: string;
    groomTime: string;
    groomPlace: string;
    brideDOB: string;
    brideTime: string;
    bridePlace: string;
  }

  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  const formatResponseHtml = (text: string): string => {
    if (!text) return "";

    const escaped = escapeHtml(text);

    // Headings (markdown style)
    const withHeadings = escaped
      .replace(/^######\s+(.*)$/gm, "<h6>$1</h6>")
      .replace(/^#####\s+(.*)$/gm, "<h5>$1</h5>")
      .replace(/^####\s+(.*)$/gm, "<h4>$1</h4>")
      .replace(/^###\s+(.*)$/gm, "<h3>$1</h3>")
      .replace(/^##\s+(.*)$/gm, "<h2>$1</h2>")
      .replace(/^#\s+(.*)$/gm, "<h1>$1</h1>");

    // Bold and italic patterns
    const withBold = withHeadings
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/__(.+?)__/g, "<strong>$1</strong>");

    const withItalic = withBold
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/_(.+?)_/g, "<em>$1</em>");

    // Convert markdown bullet lines to list items
    const lines = withItalic.split(/\r?\n/);
    let resultHtml = "";
    let inList = false;

    const flushList = (listHtml: string) => (listHtml ? `<ul>${listHtml}</ul>` : "");
    let listItems = "";

    for (const line of lines) {
      const listMatch = line.match(/^\s*([\-\*])\s+(.*)$/);
      if (listMatch) {
        inList = true;
        listItems += `<li>${listMatch[2]}</li>`;
      } else {
        if (inList) {
          resultHtml += flushList(listItems);
          listItems = "";
          inList = false;
        }
        if (line.trim() === "") {
          resultHtml += "<br />";
        } else {
          // preserve heading tags if present, else paragraph with line breaks
          if (/^<h[1-6]>/.test(line)) {
            resultHtml += line;
          } else {
            resultHtml += `<p>${line}</p>`;
          }
        }
      }
    }

    if (inList) {
      resultHtml += flushList(listItems);
    }

    return resultHtml;
  };

   async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const groom = (e.target as HTMLFormElement).groom.value;
    const bride = (e.target as HTMLFormElement).bride.value;
    const groomDOB = (e.target as HTMLFormElement).groomDOB.value;
    const groomTime = (e.target as HTMLFormElement).groomTime.value;
    const groomPlace = (e.target as HTMLFormElement).groomPlace.value;
    const brideDOB = (e.target as HTMLFormElement).brideDOB.value;
    const brideTime = (e.target as HTMLFormElement).brideTime.value;
    const bridePlace = (e.target as HTMLFormElement).bridePlace.value;

    const res = await fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groom, bride, groomDOB, groomTime, groomPlace, brideDOB, brideTime, bridePlace } as MatchRequest),
    });

    const data = (await res.json());
    setResult(data.reply);
    setLoading(false);
  }

  return (
    <div className="astro-page-container">
      <section className="astro-card">
        <h1 className="astro-title">Horoscope Match</h1>

        <form className="astro-form" onSubmit={handleSubmit}>
          <fieldset className="astro-fieldset">
            <legend className="astro-legend">Groom Details</legend>

            <label className="astro-label">Name
              <input className="astro-input" name="groom" placeholder="Groom Name" required />
            </label>
            <label className="astro-label">Date of Birth
              <input className="astro-input" name="groomDOB" type="date" required />
            </label>
            <label className="astro-label">Time of Birth
              <input className="astro-input" name="groomTime" type="time" required />
            </label>
            <label className="astro-label">Place of Birth
              <input className="astro-input" name="groomPlace" placeholder="Groom Place of Birth" required />
            </label>
          </fieldset>

          <fieldset className="astro-fieldset">
            <legend className="astro-legend">Bride Details</legend>

            <label className="astro-label">Name
              <input className="astro-input" name="bride" placeholder="Bride Name" required />
            </label>
            <label className="astro-label">Date of Birth
              <input className="astro-input" name="brideDOB" type="date" required />
            </label>
            <label className="astro-label">Time of Birth
              <input className="astro-input" name="brideTime" type="time" required />
            </label>
            <label className="astro-label">Place of Birth
              <input className="astro-input" name="bridePlace" placeholder="Bride Place of Birth" required />
            </label>
          </fieldset>

          <button className="astro-button" type="submit" disabled={loading}>
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg className="astro-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
                  <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
                Loading...
              </span>
            ) : (
              "Check Match"
            )}
          </button>
        </form>

        <div
          className="astro-result"
          dangerouslySetInnerHTML={{
            __html: result
              ? formatResponseHtml(result)
              : "<p>Compatibility results will appear here...</p>",
          }}
        />
      </section>
    </div>
  );
}