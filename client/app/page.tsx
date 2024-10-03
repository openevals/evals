import type { Metadata } from "next";
import Editor from "./components/editor/editor";

export const metadata: Metadata = {
  title: "OpenEvals - Create an eval",
  description: "Evals for the public",
};

export default function Home() {
  return (<Editor />);
}
