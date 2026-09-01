import { Link, useLocation } from "react-router-dom";
import PageHeader from "../components/PageHeader";

type ReturnState = { from?: string } | null;

export function LoginChoice() {
  const location = useLocation();
  const from = (location.state as ReturnState)?.from;
  return (
    <Choice
      title="Sign in to NailBook"
      text="Choose the account you want to use."
      first={{ to: "/login/client", label: "Sign in as Client" }}
      second={{ to: "/login/artist", label: "Sign in as Artist" }}
      from={from}
    />
  );
}

export function SignupChoice() {
  const location = useLocation();
  const from = (location.state as ReturnState)?.from;
  return (
    <Choice
      title="Create your NailBook account"
      text="Choose the account type that matches you."
      first={{ to: "/signup/client", label: "Sign up as Client" }}
      second={{ to: "/signup/artist", label: "Sign up as Artist" }}
      from={from}
    />
  );
}

function Choice({
  title,
  text,
  first,
  second,
  from,
}: {
  title: string;
  text: string;
  first: { to: string; label: string };
  second: { to: string; label: string };
  from?: string;
}) {
  const state = from ? { from } : undefined;
  return (
    <main>
      <PageHeader eyebrow="NAILBOOK ACCOUNT" title={title} text={text} />
      <section className="choiceGrid">
        <Link className="choiceCard" to={first.to} state={state}>
          <h2>{first.label}</h2>
          <p>Continue with this account type.</p>
        </Link>
        <Link className="choiceCard" to={second.to} state={state}>
          <h2>{second.label}</h2>
          <p>Continue with this account type.</p>
        </Link>
      </section>
    </main>
  );
}
