import type { Metadata } from "next";
import React from "react";
import UpvoteEvalsComponent from "../../components/upvoteEvals";

export const metadata: Metadata = {
  title: "OpenEvals - Vote on important evals",
  description: "Evals for the public",
};

export default function EvalSearchPage() {
  return (<UpvoteEvalsComponent />);
}
