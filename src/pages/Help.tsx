import { ChevronDown } from "lucide-react";
import PageHeader from "../components/PageHeader";

const questions = [
  ["How do I find a nail artist?", "Open Find Artist and search by city or choose a specialty."],
  ["Can I book an appointment online?", "Yes. Open an artist profile, choose a service and submit a booking request."],
  ["How do I create an artist account?", "Choose Create Account, then select Artist and complete your profile details."],
  ["What happens after I sign up?", "If email confirmation is enabled in Supabase, confirm your email first and then sign in."],
];

export default function Help() {
  return <main><PageHeader eyebrow="SUPPORT" title="Help & Support" text="A few quick answers to the questions people usually have." /><section className="faqList">{questions.map(([q,a]) => <details key={q}><summary>{q}<ChevronDown size={18}/></summary><p>{a}</p></details>)}</section></main>;
}
