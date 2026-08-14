"use client";

import React from "react";
import { Trash2, Edit3, MessageSquare, Mic, Camera, Smartphone, Globe } from "lucide-react";

export interface TransactionItemData {
  id: string;
  amount: string;
  currency: string;
  description: string | null;
  source: string;
  rawInput: string | null;
  transactionDate: string | Date;
  user: {
    id: string;
    name: string;
    role: string;
  };
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}

interface TransactionItemProps {
  transaction: TransactionItemData;
  onEdit: (t: TransactionItemData) => void;
  onDelete: (id: string) => void;
}

export function TransactionItem({
  transaction,
  onEdit,
  onDelete,
}: TransactionItemProps) {
  const formatSom = (num: string | number) =>
    new Intl.NumberFormat("ru-RU").format(parseFloat(num.toString())) + " с";

  const isHusband = transaction.user.name === "Максат";

  const getSourceIcon = (src: string) => {
    switch (src) {
      case "telegram_voice":
        return <Mic className="w-3 h-3 text-purple-400" title="Голосовое сообщение" />;
      case "telegram_photo":
        return <Camera className="w-3 h-3 text-blue-400" title="Фото чека" />;
      case "telegram_text":
        return <MessageSquare className="w-3 h-3 text-sky-400" title="Telegram бот" />;
      case "ios_shortcut":
        return <Smartphone className="w-3 h-3 text-amber-400" title="iOS Команда" />;
      default:
        return <Globe className="w-3 h-3 text-emerald-400" title="Веб-сайт" />;
    }
  };

  const timeStr = new Date(transaction.transactionDate).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all group">
      {/* Left: Icon & Info */}
      <div className="flex items-center space-x-3.5 min-w-0">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-inner"
          style={{
            backgroundColor: `${transaction.category.color}15`,
            border: `1px solid ${transaction.category.color}30`,
          }}
        >
          {transaction.category.icon}
        </div>

        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-semibold text-white truncate">
              {transaction.category.name}
            </h4>
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                isHusband
                  ? "bg-blue-500/15 text-blue-300 border border-blue-500/20"
                  : "bg-pink-500/15 text-pink-300 border border-pink-500/20"
              }`}
            >
              {isHusband ? "👨 Максат" : "👩 Баяна"}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
            {transaction.description ? (
              <span className="truncate max-w-[160px] sm:max-w-xs text-slate-300">
                {transaction.description}
              </span>
            ) : null}
            <span className="flex items-center space-x-1 text-[11px] text-slate-500">
              {getSourceIcon(transaction.source)}
              <span>{timeStr}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right: Amount & Actions */}
      <div className="flex items-center space-x-2 pl-3">
        <div className="text-right">
          <div className="text-sm sm:text-base font-bold text-white tracking-tight">
            -{formatSom(transaction.amount)}
          </div>
        </div>

        <div className="flex items-center opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(transaction)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Редактировать"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(transaction.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Удалить"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
