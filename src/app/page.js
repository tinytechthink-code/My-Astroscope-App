"use client";
import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const groom = e.target.groom.value;
    const bride = e.target.bride.value;

    const res = await fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groom, bride }),
    });

    const data = await res.json();
    setResult(data.reply);
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Horoscope Match</h1>

      <form onSubmit={handleSubmit}>
        <input name="groom" placeholder="Groom Name" required />
        <br /><br />
        <input name="bride" placeholder="Bride Name" required />
        <br /><br />
        <button type="submit">Check Match</button>
      </form>

      <p>{result}</p>
    </div>
  );
}