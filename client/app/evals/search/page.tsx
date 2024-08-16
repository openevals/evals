import type { Metadata } from "next";
import React from "react";
import SearchEvalsComponent from "../../components/searchEvals";

export const metadata: Metadata = {
  title: "OpenEvals - Search results",
  description: "Evals for the public",
};

export default function EvalSearchPage() {
  return (<SearchEvalsComponent />);
}
