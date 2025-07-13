"use client";
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const mockData = [
  { hour: "08:00", "image-to-word": 66.7, "word-to-image": 100, "image-fill-word": 50 },
  { hour: "09:00", "image-to-word": 80, "word-to-image": 90, "image-fill-word": 60 },
  { hour: "10:00", "image-to-word": 90, "word-to-image": 80, "image-fill-word": 70 },
];

export default function LanguageBarChart({ data = mockData, selectedLanguage = "english" }) {
  const languageNames = {
    'english': 'Tiếng Anh',
    'korean': 'Tiếng Hàn', 
    'japanese': 'Tiếng Nhật',
    'chinese': 'Tiếng Trung'
  };

  return (
    <div style={{ width: "100%", height: 350 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} />
          <Tooltip />
          <Legend />
          <Bar dataKey="image-to-word" fill="#8884d8" name="Hình → Từ" />
          <Bar dataKey="word-to-image" fill="#82ca9d" name="Từ → Hình" />
          <Bar dataKey="image-fill-word" fill="#ff7300" name="Hình + Điền từ" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 