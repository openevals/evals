import type { Metadata } from "next";
import Editor from "./components/editor";

export const metadata: Metadata = {
  title: "OpenEvals - Create new evals",
  description: "Evals for the public",
};

export default function Home() {
  return (<Editor />);
}
