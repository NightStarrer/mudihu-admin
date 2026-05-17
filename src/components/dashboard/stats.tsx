"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR } from "@/lib/proposals/calculate-totals";
import { Users, FileText, Send, TrendingUp } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export function DashboardStats({
  clientCount,
  draftCount,
  sentCount,
  pipelineValue,
}: {
  clientCount: number;
  draftCount: number;
  sentCount: number;
  pipelineValue: number;
}) {
  const stats = [
    {
      label: "Clients",
      value: clientCount.toString(),
      icon: Users,
    },
    {
      label: "Draft proposals",
      value: draftCount.toString(),
      icon: FileText,
    },
    {
      label: "Sent proposals",
      value: sentCount.toString(),
      icon: Send,
    },
    {
      label: "Pipeline value",
      value: formatINR(pipelineValue),
      icon: TrendingUp,
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <motion.div key={stat.label} variants={item}>
            <Card className="border-border/60 transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight">
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
