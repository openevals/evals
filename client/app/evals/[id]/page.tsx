import type { Metadata } from "next";
import ItemDetails from '../../components/itemDetails';
import React from "react";

export const metadata: Metadata = {
  title: "OpenEvals",
  description: "Evals for the public",
};

export default function EvalDetailsPage() {
  return (<ItemDetails />);
}
