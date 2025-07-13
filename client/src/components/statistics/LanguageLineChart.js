"use client";
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const mockData = [
  { date: "2025-07-10", "image-to-word": 75, "word-to-image": 60, "image-fill-word": 90 },
  { date: "2025-07-11", "image-to-word": 80, "word-to-image": 70, "image-fill-word": 85 },
  { date: "2025-07-12", "image-to-word": 90, "word-to-image": 80, "image-fill-word": 95 },
];

export default function LanguageLineChart({ data = mockData, selectedLanguage = "english" }) {
  const languageNames = {
    'english': 'Tiếng Anh',
    'korean': 'Tiếng Hàn', 
    'japanese': 'Tiếng Nhật',
    'chinese': 'Tiếng Trung'
  };

  return (
    <div style={{ width: "100%", height: 350 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="image-to-word" stroke="#8884d8" name="Hình → Từ" />
          <Line type="monotone" dataKey="word-to-image" stroke="#82ca9d" name="Từ → Hình" />
          <Line type="monotone" dataKey="image-fill-word" stroke="#ff7300" name="Hình + Điền từ" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 