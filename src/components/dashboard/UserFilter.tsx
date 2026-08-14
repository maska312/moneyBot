"use client";

import React from "react";
import { Users, User as UserIcon } from "lucide-react";

interface UserFilterProps {
  selectedUser: string; // "all" | "Максат" | "Баяна"
  onChange: (user: string) => void;
}

export function UserFilter({ selectedUser, onChange }: UserFilterProps) {
  const options = [
    { id: "all", label: "Все расходы", icon: Users },
    { id: "Максат", label: "👨 Максат", icon: UserIcon },
    { id: "Баяна", label: "👩 Баяна", icon: UserIcon },
  ];

  return (
    <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 max-w-md">
      {options.map((opt) => {
        const isActive = selectedUser === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              isActive
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
