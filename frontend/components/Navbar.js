"use client";

import { Bell, User } from "lucide-react";

export default function Navbar() {
  return (
    <div className="w-full h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-50">
      <div>
        <h1 className="text-xl font-bold text-blue-600">
          Smart Interview Coach
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <Bell className="w-5 h-5 text-gray-600" />
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
          <User />
        </div>
      </div>
    </div>
  );
}