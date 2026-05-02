import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Campus — Student Skill Exchange & Freelance Community" },
      {
        name: "description",
        content:
          "Trade skills, freelance for peers, share notes, and earn CampusCoins on your campus community platform. No payments — just a credits-based learning economy.",
      },
      { property: "og:title", content: "Campus — Earn CampusCoins by learning & sharing" },
      {
        property: "og:description",
        content:
          "A credits-powered campus community: skill exchange, micro-freelancing, notes marketplace, and more.",
      },
      { property: "og:image", content: "/images/campus-hero.jpg" },
      { name: "twitter:image", content: "/images/campus-hero.jpg" },
    ],
  }),
  component: Index,
});

import { useEffect } from "react";

function Index() {
  useEffect(() => {
    window.location.href = "/campus.html";
  }, []);
  
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      Loading Campus Platform...
    </div>
  );
}
