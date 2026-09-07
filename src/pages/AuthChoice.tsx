import { Link, useLocation } from "react-router-dom";
import PageHeader from "../components/PageHeader";

type ReturnState = { from?: string } | null;

export function LoginChoice() {
  const location = useLocation();
  const from = (location.state as ReturnState)?.from;
  return (
    <Choice
      title="Sign in to NailBook"
      text="Choose the account you're signing in with."
      loginTo={{ client: "/login/client", artist: "/login/artist" }}
      from={from}
      footerPrompt="New to NailBook?"
      footerLinkText="Create an account"
      footerLinkTo="/signup"
    />
  );
}

export function SignupChoice() {
  const location = useLocation();
  const from = (location.state as ReturnState)?.from;
  return (
    <Choice
      title="Create your account"
      text="Choose the account type that fits you. You can add more detail once you're in."
      loginTo={{ client: "/signup/client", artist: "/signup/artist" }}
      from={from}
      footerPrompt="Already have an account?"
      footerLinkText="Sign in"
      footerLinkTo="/login"
    />
  );
}

function Choice({
  title,
  text,
  loginTo,
  from,
  footerPrompt,
  footerLinkText,
  footerLinkTo,
}: {
  title: string;
  text: string;
  loginTo: { client: string; artist: string };
  from?: string;
  footerPrompt: string;
  footerLinkText: string;
  footerLinkTo: string;
}) {
  const state = from ? { from } : undefined;

  return (
    <main>
      <PageHeader eyebrow="NAILBOOK ACCOUNT" title={title} text={text} />

      <section className="roleSplit">
        <div className="rolePane">
          <span className="roleLabel">For clients</span>
          <p className="roleText">Find a nail artist near you and book an appointment in a few minutes.</p>
          <Link className="primaryButton" to={loginTo.client} state={state}>Continue as a client</Link>
        </div>

        <div className="rolePane">
          <span className="roleLabel">For artists</span>
          <p className="roleText">Manage your bookings, services, and clients from one dashboard.</p>
          <Link className="outlineButton" to={loginTo.artist} state={state}>Continue as an artist</Link>
        </div>
      </section>

      <p className="choiceFooterNote">
        {footerPrompt} <Link to={footerLinkTo} state={state}>{footerLinkText}</Link>
      </p>
    </main>
  );
}
