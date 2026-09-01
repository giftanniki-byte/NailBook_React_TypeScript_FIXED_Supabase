import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function BackendTest() {
  const [result, setResult] = useState("No test has been run yet.");

  async function testConnection() {
    if (!supabase) {
      setResult(
        "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.",
      );
      return;
    }

    // user_id is a real column on profiles, so this is a safe lightweight test.
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id")
      .limit(1);

    if (error) {
      setResult(`Supabase responded with an error: ${error.message}`);
      return;
    }

    setResult(`Connection looks good. Rows returned: ${data?.length ?? 0}`);
  }

  return (
    <main className="centerPage">
      <span className="eyebrow">DEVELOPER TOOL</span>
      <h1>Backend Test</h1>
      <p>
        Use this page to check whether the browser can reach the NailBook
        Supabase project.
      </p>
      <button className="primaryButton" onClick={testConnection}>
        Run Test
      </button>
      <pre className="testOutput">{result}</pre>
    </main>
  );
}
