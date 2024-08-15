import type { Metadata } from "next";
import GithubLoginButton from "../components/auth/github";

export const metadata: Metadata = {
  title: "OpenEvals",
  description: "Evals for the public",
};

export default function AuthenticationPage() {
  return (
    <GithubLoginButton text="Sign in with GitHub" />
  );
}
