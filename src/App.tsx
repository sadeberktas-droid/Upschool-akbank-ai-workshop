/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { InterviewPrep } from './components/InterviewPrep.tsx';
import { TrainingAnalyzer } from './components/TrainingAnalyzer.tsx';
import { MockInterviewChat } from './components/MockInterviewChat.tsx';
import { SavedSessions } from './components/SavedSessions.tsx';
import { InterviewPrepResult, TrainingAnalysisResult } from './types/index.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<'interview' | 'training' | 'chat' | 'saved'>('interview');

  // Simulation prefill state
  const [simulationParams, setSimulationParams] = useState<{
    title: string;
    role: string;
    question?: string;
  }>({
    title: 'Senior Engineering Manager',
    role: 'Senior Full Stack Developer',
  });

  // Local storage state
  const [savedInterviews, setSavedInterviews] = useState<InterviewPrepResult[]>(() => {
    try {
      const stored = localStorage.getItem('career_mentor_interviews');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [savedTrainings, setSavedTrainings] = useState<TrainingAnalysisResult[]>(() => {
    try {
      const stored = localStorage.getItem('career_mentor_trainings');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('career_mentor_interviews', JSON.stringify(savedInterviews));
    } catch (e) {
      console.error(e);
    }
  }, [savedInterviews]);

  useEffect(() => {
    try {
      localStorage.setItem('career_mentor_trainings', JSON.stringify(savedTrainings));
    } catch (e) {
      console.error(e);
    }
  }, [savedTrainings]);

  const handleStartSimulation = (title: string, role: string, question?: string) => {
    setSimulationParams({ title, role, question });
    setActiveTab('chat');
  };

  const handleSaveInterview = (result: InterviewPrepResult) => {
    setSavedInterviews((prev) => [result, ...prev]);
  };

  const handleSaveTraining = (result: TrainingAnalysisResult) => {
    setSavedTrainings((prev) => [result, ...prev]);
  };

  const handleDeleteInterview = (index: number) => {
    setSavedInterviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteTraining = (index: number) => {
    setSavedTrainings((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar adhering to Top Bar Contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickStart={() => setActiveTab('interview')}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {activeTab === 'interview' && (
          <InterviewPrep
            onStartSimulation={handleStartSimulation}
            onSaveResult={handleSaveInterview}
            savedResults={savedInterviews}
          />
        )}

        {activeTab === 'training' && (
          <TrainingAnalyzer
            onSaveResult={handleSaveTraining}
            savedResults={savedTrainings}
          />
        )}

        {activeTab === 'chat' && (
          <MockInterviewChat
            initialTitle={simulationParams.title}
            initialRole={simulationParams.role}
            initialQuestion={simulationParams.question}
          />
        )}

        {activeTab === 'saved' && (
          <SavedSessions
            interviewPlans={savedInterviews}
            trainingRoadmaps={savedTrainings}
            onSelectInterview={(plan) => {
              setSimulationParams({
                title: plan.interviewerTitle,
                role: plan.candidateRole,
              });
              setActiveTab('interview');
            }}
            onSelectTraining={() => {
              setActiveTab('training');
            }}
            onDeleteInterview={handleDeleteInterview}
            onDeleteTraining={handleDeleteTraining}
          />
        )}
      </main>

      {/* Quiet, Clean Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/50 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© CareerMentor AI — Unvana Özel Mülakat Soruları & Eğitim Yol Haritası Ajanı</p>
          <div className="flex items-center gap-4">
            <span>STAR Tekniği Uyumlu</span>
            <span aria-hidden="true">·</span>
            <span>Gemini Destekli Analiz</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
