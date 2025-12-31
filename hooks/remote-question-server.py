#!/usr/bin/env python3
"""
Remote Question Server with Build Dashboard

A comprehensive HTTP server that displays:
- Build progress and phase status
- Current question interface
- Build queue with dependencies
- Recent activity log

Usage:
    python remote-question-server.py [port]

Access:
    - Local: http://localhost:8765
    - Same network (phone/tablet): http://<your-computer-ip>:8765

Environment:
    REMOTE_QUESTIONS_PORT - Port to run on (default: 8765)
    CLAUDE_PROJECT_DIR - Project directory to monitor (default: .)

Version: 4.6.1
"""

import json
import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from datetime import datetime
from urllib.parse import parse_qs
import threading
import time

DEFAULT_PORT = 8765
QUESTION_FILE = ".claude/current-question.json"
ANSWER_FILE = ".claude/pending-answer.json"
STATE_FILE = ".claude/hustle-build-state.json"
ACTIVITY_LOG_FILE = ".claude/workflow-logs/activity.json"

# Full dashboard HTML template
HTML_TEMPLATE = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hustle Build Dashboard</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            min-height: 100vh;
            color: #e0e0e0;
            padding: 15px;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
        }

        /* Header */
        .header {
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            flex-wrap: wrap;
            gap: 10px;
        }
        .header h1 {
            color: #00d4ff;
            font-size: 1.4rem;
            margin-bottom: 5px;
        }
        .header .subtitle {
            color: #888;
            font-size: 0.85rem;
        }
        .build-status {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
        }
        .build-status.in_progress {
            background: rgba(0,212,255,0.2);
            color: #00d4ff;
        }
        .build-status.complete {
            background: rgba(0,255,128,0.2);
            color: #00ff80;
        }
        .build-status.pending {
            background: rgba(255,204,0,0.2);
            color: #ffcc00;
        }
        .build-status.no-build {
            background: rgba(255,255,255,0.1);
            color: #888;
        }
        .build-meta {
            display: flex;
            gap: 20px;
            margin-top: 15px;
            flex-wrap: wrap;
        }
        .build-meta-item {
            font-size: 0.8rem;
        }
        .build-meta-item .label {
            color: #666;
        }
        .build-meta-item .value {
            color: #aaa;
        }

        /* Phase Progress */
        .card {
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .card-title {
            color: #888;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
        }
        .phases {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .phase-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 12px;
            background: rgba(255,255,255,0.03);
            border-radius: 6px;
            font-size: 0.9rem;
        }
        .phase-icon {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.7rem;
            flex-shrink: 0;
        }
        .phase-icon.completed {
            background: #00ff80;
            color: #1a1a2e;
        }
        .phase-icon.in_progress {
            background: #00d4ff;
            color: #1a1a2e;
            animation: pulse 1.5s infinite;
        }
        .phase-icon.pending {
            background: rgba(255,255,255,0.1);
            color: #666;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(0.95); }
        }
        .phase-name {
            flex: 1;
        }
        .phase-name.active {
            color: #00d4ff;
            font-weight: 600;
        }
        .phase-name.completed {
            color: #00ff80;
        }
        .phase-name.pending {
            color: #666;
        }

        /* Question Card */
        .question-card {
            background: linear-gradient(135deg, rgba(0,212,255,0.1) 0%, rgba(0,168,204,0.05) 100%);
            border-color: rgba(0,212,255,0.3);
        }
        .phase-badge {
            background: #00d4ff;
            color: #1a1a2e;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 12px;
        }
        .question-text {
            font-size: 1.05rem;
            line-height: 1.5;
            margin-bottom: 15px;
        }
        .options {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .option {
            background: rgba(255,255,255,0.08);
            border: 2px solid transparent;
            border-radius: 8px;
            padding: 12px 15px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .option:hover {
            background: rgba(0,212,255,0.1);
            border-color: #00d4ff;
        }
        .option.selected {
            background: rgba(0,212,255,0.2);
            border-color: #00d4ff;
        }
        .option-label {
            font-weight: 600;
            font-size: 0.95rem;
        }
        .option-description {
            font-size: 0.85rem;
            color: #aaa;
            margin-top: 3px;
        }
        .custom-input {
            display: none;
            margin-top: 12px;
        }
        .custom-input.visible {
            display: block;
        }
        .custom-input textarea {
            width: 100%;
            padding: 12px;
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 8px;
            color: #e0e0e0;
            font-family: inherit;
            font-size: 0.95rem;
            resize: vertical;
            min-height: 70px;
        }
        .custom-input textarea:focus {
            outline: none;
            border-color: #00d4ff;
        }
        .submit-btn {
            width: 100%;
            background: linear-gradient(135deg, #00d4ff 0%, #00a8cc 100%);
            color: #1a1a2e;
            border: none;
            border-radius: 8px;
            padding: 14px;
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
            margin-top: 15px;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(0,212,255,0.3);
        }
        .submit-btn:disabled {
            background: #444;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        .no-question {
            text-align: center;
            padding: 30px 20px;
            color: #666;
        }
        .no-question .icon {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        .success-msg {
            background: rgba(0,255,128,0.1);
            color: #00ff80;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }

        /* Build Queue */
        .queue-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.85rem;
        }
        .queue-table th {
            text-align: left;
            padding: 10px;
            color: #666;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            font-weight: 500;
        }
        .queue-table td {
            padding: 10px;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .queue-type {
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        .queue-type.api { background: rgba(255,107,107,0.2); color: #ff6b6b; }
        .queue-type.component { background: rgba(78,205,196,0.2); color: #4ecdc4; }
        .queue-type.page { background: rgba(255,230,109,0.2); color: #ffe66d; }
        .queue-type.combined { background: rgba(168,130,255,0.2); color: #a882ff; }

        .queue-status {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }
        .status-dot.done { background: #00ff80; }
        .status-dot.building { background: #00d4ff; animation: pulse 1.5s infinite; }
        .status-dot.pending { background: #666; }
        .status-dot.failed { background: #ff6b6b; }

        /* Activity Log */
        .activity-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .activity-item {
            display: flex;
            gap: 10px;
            padding: 10px;
            background: rgba(255,255,255,0.03);
            border-radius: 6px;
            font-size: 0.85rem;
        }
        .activity-time {
            color: #666;
            white-space: nowrap;
            font-family: monospace;
        }
        .activity-msg {
            flex: 1;
            color: #aaa;
        }
        .activity-msg strong {
            color: #e0e0e0;
        }

        /* Footer */
        .footer {
            text-align: center;
            padding: 15px;
            color: #444;
            font-size: 0.75rem;
        }

        /* Grid layout for larger screens */
        @media (min-width: 768px) {
            .grid-2 {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }
        }

        /* Small mobile adjustments */
        @media (max-width: 480px) {
            body { padding: 10px; }
            .header { padding: 15px; }
            .card { padding: 15px; }
            .header h1 { font-size: 1.2rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="header-top">
                <div>
                    <h1>HUSTLE BUILD DASHBOARD</h1>
                    <div class="subtitle" id="buildName">No active build</div>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <button id="notifyBtn" onclick="requestNotificationPermission()"
                            style="padding: 8px 12px; border-radius: 20px; border: none; cursor: pointer; font-size: 0.8rem; transition: all 0.2s;">
                        &#x1F515; Enable
                    </button>
                    <div class="build-status no-build" id="buildStatus">
                        <span id="buildStatusText">IDLE</span>
                    </div>
                </div>
            </div>
            <div class="build-meta" id="buildMeta" style="display: none;">
                <div class="build-meta-item">
                    <span class="label">Started:</span>
                    <span class="value" id="buildStarted">-</span>
                </div>
                <div class="build-meta-item">
                    <span class="label">Phase:</span>
                    <span class="value" id="buildPhase">-</span>
                </div>
                <div class="build-meta-item">
                    <span class="label">Mode:</span>
                    <span class="value" id="buildMode">-</span>
                </div>
            </div>
        </div>

        <!-- Phase Progress -->
        <div class="card" id="phaseCard">
            <div class="card-title">Phase Progress</div>
            <div class="phases" id="phaseList">
                <div class="phase-item">
                    <div class="phase-icon pending">1</div>
                    <div class="phase-name pending">Document Intake & Parsing</div>
                </div>
                <div class="phase-item">
                    <div class="phase-icon pending">2</div>
                    <div class="phase-name pending">Parse Request</div>
                </div>
                <div class="phase-item">
                    <div class="phase-icon pending">3</div>
                    <div class="phase-name pending">Decompose Into Workflows</div>
                </div>
                <div class="phase-item">
                    <div class="phase-icon pending">4</div>
                    <div class="phase-name pending">Orchestrator Interview</div>
                </div>
                <div class="phase-item">
                    <div class="phase-icon pending">5</div>
                    <div class="phase-name pending">Create Orchestration State</div>
                </div>
                <div class="phase-item">
                    <div class="phase-icon pending">6</div>
                    <div class="phase-name pending">Execute Workflows</div>
                </div>
                <div class="phase-item">
                    <div class="phase-icon pending">7</div>
                    <div class="phase-name pending">Cross-Workflow Wiring</div>
                </div>
                <div class="phase-item">
                    <div class="phase-icon pending">8</div>
                    <div class="phase-name pending">Final Verification</div>
                </div>
                <div class="phase-item">
                    <div class="phase-icon pending">9</div>
                    <div class="phase-name pending">Documentation Rollup</div>
                </div>
                <div class="phase-item">
                    <div class="phase-icon pending">10</div>
                    <div class="phase-name pending">Completion</div>
                </div>
            </div>
        </div>

        <!-- Current Question -->
        <div class="card question-card" id="questionCard">
            <div class="card-title">Current Question</div>
            <div id="questionContent">
                <div class="no-question">
                    <div class="icon">&#x1F4AD;</div>
                    <div>No pending questions</div>
                    <div style="font-size: 0.8rem; margin-top: 5px;">Polling every 2 seconds...</div>
                </div>
            </div>
        </div>

        <div class="grid-2">
            <!-- Build Queue -->
            <div class="card" id="queueCard">
                <div class="card-title">Build Queue</div>
                <div id="queueContent">
                    <div class="no-question" style="padding: 20px;">
                        <div>No items in queue</div>
                    </div>
                </div>
            </div>

            <!-- Activity Log -->
            <div class="card">
                <div class="card-title">Recent Activity</div>
                <div class="activity-list" id="activityList">
                    <div class="activity-item">
                        <span class="activity-time">--:--</span>
                        <span class="activity-msg">Waiting for build activity...</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="footer">
            Hustle Build v4.6.1 | Polling every 2 seconds | <span id="lastUpdate">-</span>
        </div>
    </div>

    <script>
        const PHASES = [
            "Document Intake & Parsing",
            "Parse Request",
            "Decompose Into Workflows",
            "Orchestrator Interview",
            "Create Orchestration State",
            "Execute Workflows",
            "Cross-Workflow Wiring",
            "Final Verification",
            "Documentation Rollup",
            "Completion"
        ];

        let currentQuestion = null;
        let selectedOption = null;
        let answerHistory = JSON.parse(localStorage.getItem('answerHistory') || '[]');
        let notificationsEnabled = false;
        let lastPhase = null;
        let lastBuildStatus = null;

        // Browser Notification Support
        async function requestNotificationPermission() {
            if (!('Notification' in window)) {
                console.log('Browser does not support notifications');
                return;
            }

            try {
                const permission = await Notification.requestPermission();
                notificationsEnabled = permission === 'granted';
                updateNotificationButton();

                if (notificationsEnabled) {
                    showNotification('Notifications Enabled', 'You will receive alerts for questions and phase changes', 'setup');
                }
            } catch (e) {
                console.error('Notification permission error:', e);
            }
        }

        function updateNotificationButton() {
            const btn = document.getElementById('notifyBtn');
            if (btn) {
                if (notificationsEnabled) {
                    btn.innerHTML = '&#x1F514; ON';
                    btn.style.background = 'rgba(0,255,128,0.2)';
                    btn.style.color = '#00ff80';
                } else {
                    btn.innerHTML = '&#x1F515; Enable';
                    btn.style.background = 'rgba(255,255,255,0.1)';
                    btn.style.color = '#888';
                }
            }
        }

        function showNotification(title, body, tag) {
            if (!notificationsEnabled) return;

            // Only show if page is not visible (user is away)
            if (document.visibilityState === 'hidden' || !document.hasFocus()) {
                try {
                    const notification = new Notification(title, {
                        body: body,
                        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔨</text></svg>',
                        tag: tag || 'hustle-build',
                        requireInteraction: tag === 'question'
                    });

                    notification.onclick = () => {
                        window.focus();
                        notification.close();
                    };

                    // Auto-close non-question notifications after 5 seconds
                    if (tag !== 'question') {
                        setTimeout(() => notification.close(), 5000);
                    }
                } catch (e) {
                    console.error('Notification error:', e);
                }
            }
        }

        // Check for phase/status changes and notify
        function checkForChanges(data) {
            if (!data.build) return;

            const currentPhase = data.build.current_phase;
            const currentStatus = data.build.status;

            // Notify on phase change
            if (lastPhase !== null && currentPhase !== lastPhase) {
                const phaseName = PHASES[currentPhase - 1] || `Phase ${currentPhase}`;
                showNotification(
                    `Phase ${currentPhase}/10: ${phaseName}`,
                    'Build progressed to next phase',
                    'phase-change'
                );
            }

            // Notify on build completion
            if (lastBuildStatus !== 'complete' && currentStatus === 'complete') {
                showNotification(
                    'Build Complete! ✅',
                    data.build.name || 'Your build has finished',
                    'build-complete'
                );
            }

            lastPhase = currentPhase;
            lastBuildStatus = currentStatus;
        }

        // Initialize notifications on page load
        document.addEventListener('DOMContentLoaded', () => {
            // Check if already granted
            if ('Notification' in window && Notification.permission === 'granted') {
                notificationsEnabled = true;
            }
            updateNotificationButton();
        });

        // Fetch build status
        async function fetchStatus() {
            try {
                const response = await fetch('/api/status');
                const data = await response.json();
                updateBuildStatus(data);
                checkForChanges(data);
                updateLastUpdate();
            } catch (e) {
                console.error('Error fetching status:', e);
            }
        }

        // Fetch current question
        async function fetchQuestion() {
            try {
                const response = await fetch('/api/question');
                const data = await response.json();

                if (data.question && data.question !== currentQuestion?.question) {
                    currentQuestion = data;
                    renderQuestion(data);
                    // Notify about new question
                    showNotification(
                        '❓ Question Needs Answer',
                        data.question.substring(0, 100),
                        'question'
                    );
                } else if (!data.question && currentQuestion) {
                    currentQuestion = null;
                    renderNoQuestion();
                }
            } catch (e) {
                console.error('Error fetching question:', e);
            }
        }

        function updateBuildStatus(data) {
            const nameEl = document.getElementById('buildName');
            const statusEl = document.getElementById('buildStatus');
            const statusTextEl = document.getElementById('buildStatusText');
            const metaEl = document.getElementById('buildMeta');
            const startedEl = document.getElementById('buildStarted');
            const phaseEl = document.getElementById('buildPhase');
            const modeEl = document.getElementById('buildMode');

            if (data.build) {
                const build = data.build;
                nameEl.textContent = build.name || build.build_id || 'Active Build';

                statusEl.className = 'build-status ' + (build.status || 'pending');
                statusTextEl.textContent = (build.status || 'PENDING').toUpperCase();

                metaEl.style.display = 'flex';
                startedEl.textContent = formatTime(build.created_at);
                phaseEl.textContent = build.current_phase ? `${build.current_phase}/10` : '-';
                modeEl.textContent = build.mode || 'interactive';

                // Update phase progress
                updatePhaseProgress(build.current_phase || 0, build.phase_statuses || {});

                // Update build queue
                updateBuildQueue(build.decomposition);

                // Update activity
                updateActivity(build.activity || data.activity || []);
            } else {
                nameEl.textContent = 'No active build';
                statusEl.className = 'build-status no-build';
                statusTextEl.textContent = 'IDLE';
                metaEl.style.display = 'none';
                resetPhaseProgress();
            }
        }

        function updatePhaseProgress(currentPhase, statuses) {
            const phaseItems = document.querySelectorAll('.phase-item');
            phaseItems.forEach((item, i) => {
                const icon = item.querySelector('.phase-icon');
                const name = item.querySelector('.phase-name');
                const phaseNum = i + 1;
                const status = statuses[phaseNum] || (phaseNum < currentPhase ? 'completed' : (phaseNum === currentPhase ? 'in_progress' : 'pending'));

                icon.className = 'phase-icon ' + status;
                icon.textContent = status === 'completed' ? '\\u2713' : phaseNum;

                name.className = 'phase-name ' + (status === 'in_progress' ? 'active' : status);
            });
        }

        function resetPhaseProgress() {
            const phaseItems = document.querySelectorAll('.phase-item');
            phaseItems.forEach((item, i) => {
                const icon = item.querySelector('.phase-icon');
                const name = item.querySelector('.phase-name');
                icon.className = 'phase-icon pending';
                icon.textContent = i + 1;
                name.className = 'phase-name pending';
            });
        }

        function updateBuildQueue(decomposition) {
            const container = document.getElementById('queueContent');
            if (!decomposition) {
                container.innerHTML = '<div class="no-question" style="padding: 20px;"><div>No items in queue</div></div>';
                return;
            }

            const items = [];
            ['apis', 'components', 'combined_apis', 'pages'].forEach(type => {
                const typeItems = decomposition[type] || [];
                typeItems.forEach(item => {
                    items.push({...item, type: type.replace('_', ' ').replace(/s$/, '')});
                });
            });

            if (items.length === 0) {
                container.innerHTML = '<div class="no-question" style="padding: 20px;"><div>No items in queue</div></div>';
                return;
            }

            const rows = items.map(item => {
                const typeClass = item.type.toLowerCase().split(' ')[0];
                const statusClass = item.status === 'complete' ? 'done' : (item.status === 'in_progress' ? 'building' : (item.status === 'failed' ? 'failed' : 'pending'));
                const deps = (item.depends_on || []).join(', ') || '-';
                return `
                    <tr>
                        <td><span class="queue-type ${typeClass}">${item.type.toUpperCase()}</span></td>
                        <td>${item.name}</td>
                        <td>
                            <div class="queue-status">
                                <div class="status-dot ${statusClass}"></div>
                                <span>${item.status || 'pending'}</span>
                            </div>
                        </td>
                        <td style="color: #666; font-size: 0.8rem;">${deps}</td>
                    </tr>
                `;
            }).join('');

            container.innerHTML = `
                <table class="queue-table">
                    <thead>
                        <tr><th>Type</th><th>Name</th><th>Status</th><th>Deps</th></tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            `;
        }

        function updateActivity(activity) {
            const container = document.getElementById('activityList');
            if (!activity || activity.length === 0) {
                container.innerHTML = `
                    <div class="activity-item">
                        <span class="activity-time">--:--</span>
                        <span class="activity-msg">Waiting for build activity...</span>
                    </div>
                `;
                return;
            }

            container.innerHTML = activity.slice(0, 8).map(item => `
                <div class="activity-item">
                    <span class="activity-time">${formatTime(item.time)}</span>
                    <span class="activity-msg">${item.message}</span>
                </div>
            `).join('');
        }

        function formatTime(timestamp) {
            if (!timestamp) return '-';
            try {
                const date = new Date(timestamp);
                return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            } catch (e) {
                return timestamp;
            }
        }

        function updateLastUpdate() {
            document.getElementById('lastUpdate').textContent = 'Updated: ' + new Date().toLocaleTimeString();
        }

        function renderQuestion(data) {
            const content = document.getElementById('questionContent');
            const optionsHtml = data.options.map((opt, i) => {
                const label = typeof opt === 'string' ? opt : opt.label;
                const desc = typeof opt === 'object' ? opt.description : '';
                const isOther = label.toLowerCase().includes('other');
                return `
                    <div class="option" data-index="${i}" data-other="${isOther}" onclick="selectOption(${i}, ${isOther})">
                        <div class="option-label">${label}</div>
                        ${desc ? `<div class="option-description">${desc}</div>` : ''}
                    </div>
                `;
            }).join('');

            content.innerHTML = `
                <span class="phase-badge">${data.phase || data.header || 'Question'}</span>
                <div class="question-text">${data.question}</div>
                <div class="options">${optionsHtml}</div>
                <div class="custom-input" id="customInput">
                    <textarea id="customAnswer" placeholder="Enter your custom answer..."></textarea>
                </div>
                <button class="submit-btn" id="submitBtn" onclick="submitAnswer()" disabled>
                    Select an option to continue
                </button>
            `;
        }

        function renderNoQuestion() {
            document.getElementById('questionContent').innerHTML = `
                <div class="no-question">
                    <div class="icon">&#x1F4AD;</div>
                    <div>No pending questions</div>
                    <div style="font-size: 0.8rem; margin-top: 5px;">Polling every 2 seconds...</div>
                </div>
            `;
        }

        function selectOption(index, isOther) {
            selectedOption = index;
            document.querySelectorAll('.option').forEach((el, i) => {
                el.classList.toggle('selected', i === index);
            });

            const customInput = document.getElementById('customInput');
            if (customInput) {
                if (isOther) {
                    customInput.classList.add('visible');
                } else {
                    customInput.classList.remove('visible');
                }
            }

            const btn = document.getElementById('submitBtn');
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Submit Answer';
            }
        }

        async function submitAnswer() {
            if (selectedOption === null || !currentQuestion) return;

            const btn = document.getElementById('submitBtn');
            btn.disabled = true;
            btn.textContent = 'Submitting...';

            const opt = currentQuestion.options[selectedOption];
            let answer = typeof opt === 'string' ? opt : opt.label;

            if (answer.toLowerCase().includes('other')) {
                const customText = document.getElementById('customAnswer')?.value;
                if (customText) answer = customText;
            }

            try {
                const response = await fetch('/api/answer', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        question: currentQuestion.question,
                        answer: answer,
                        option_index: selectedOption,
                        phase: currentQuestion.phase || currentQuestion.header
                    })
                });

                if (response.ok) {
                    answerHistory.unshift({
                        time: new Date().toISOString(),
                        question: currentQuestion.question.substring(0, 50) + '...',
                        answer: answer
                    });
                    answerHistory = answerHistory.slice(0, 10);
                    localStorage.setItem('answerHistory', JSON.stringify(answerHistory));

                    document.getElementById('questionContent').innerHTML = `
                        <div class="success-msg">
                            <div style="font-size: 1.5rem; margin-bottom: 8px;">&#x2713;</div>
                            <div>Answer submitted!</div>
                            <div style="margin-top: 8px; color: #aaa; font-size: 0.85rem;">"${answer}"</div>
                        </div>
                    `;
                    currentQuestion = null;
                    selectedOption = null;

                    setTimeout(renderNoQuestion, 2000);
                }
            } catch (e) {
                console.error('Error submitting:', e);
                btn.disabled = false;
                btn.textContent = 'Error - Try Again';
            }
        }

        // Start polling
        setInterval(fetchStatus, 2000);
        setInterval(fetchQuestion, 2000);
        fetchStatus();
        fetchQuestion();
    </script>
</body>
</html>
'''


class QuestionHandler(BaseHTTPRequestHandler):
    """HTTP handler for the build dashboard and remote question interface."""

    def get_project_dir(self):
        return Path(os.environ.get("CLAUDE_PROJECT_DIR", "."))

    def load_state(self):
        """Load the hustle-build state file."""
        state_file = self.get_project_dir() / STATE_FILE
        if state_file.exists():
            try:
                return json.loads(state_file.read_text())
            except Exception:
                pass
        return None

    def load_activity(self):
        """Load activity log."""
        activity_file = self.get_project_dir() / ACTIVITY_LOG_FILE
        if activity_file.exists():
            try:
                data = json.loads(activity_file.read_text())
                return data.get('entries', data) if isinstance(data, dict) else data
            except Exception:
                pass
        return []

    def do_GET(self):
        if self.path == '/' or self.path == '/index.html':
            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            self.wfile.write(HTML_TEMPLATE.encode('utf-8'))

        elif self.path == '/api/question':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()

            question_file = self.get_project_dir() / QUESTION_FILE
            if question_file.exists():
                try:
                    data = json.loads(question_file.read_text())
                    self.wfile.write(json.dumps(data).encode('utf-8'))
                except Exception:
                    self.wfile.write(json.dumps({}).encode('utf-8'))
            else:
                self.wfile.write(json.dumps({}).encode('utf-8'))

        elif self.path == '/api/status':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()

            # Load build state
            state = self.load_state()
            activity = self.load_activity()

            # Check for pending question
            question_file = self.get_project_dir() / QUESTION_FILE
            has_question = question_file.exists()

            response = {
                "status": "ready",
                "has_question": has_question,
                "timestamp": datetime.now().isoformat()
            }

            if state:
                # Extract build info from state
                response["build"] = {
                    "build_id": state.get("build_id"),
                    "name": state.get("request", {}).get("original", "")[:50] if state.get("request") else state.get("build_id"),
                    "status": state.get("status", "pending"),
                    "mode": state.get("mode", "interactive"),
                    "created_at": state.get("created_at"),
                    "current_phase": self._get_current_phase(state),
                    "phase_statuses": self._get_phase_statuses(state),
                    "decomposition": state.get("decomposition"),
                    "activity": activity[-10:] if activity else []
                }
            else:
                response["build"] = None
                response["activity"] = activity[-10:] if activity else []

            self.wfile.write(json.dumps(response).encode('utf-8'))

        else:
            self.send_response(404)
            self.end_headers()

    def _get_current_phase(self, state):
        """Determine current phase from state."""
        # Check for active sub-workflow (Phase 6)
        if state.get("active_sub_workflow"):
            return 6

        # Check decomposition status
        decomp = state.get("decomposition", {})
        has_decomp = any(decomp.get(k) for k in ["apis", "components", "pages", "combined_apis"])

        # Check interview status
        interview = state.get("orchestrator_interview", {})
        interview_complete = interview.get("status") == "complete"

        if state.get("status") == "complete":
            return 10
        elif has_decomp and interview_complete:
            # Check if any workflows are done
            all_done = True
            for category in ["apis", "components", "pages", "combined_apis"]:
                for item in decomp.get(category, []):
                    if item.get("status") != "complete":
                        all_done = False
                        break
            if all_done and has_decomp:
                return 7  # Wiring phase
            return 6  # Still executing
        elif interview_complete:
            return 5  # Creating state
        elif has_decomp:
            return 4  # Interview
        elif state.get("project_spec", {}).get("extracted"):
            return 3  # Decomposition
        elif state.get("project_spec", {}).get("raw_content"):
            return 1  # Document parsing

        return 2  # Parse request

    def _get_phase_statuses(self, state):
        """Get status of each phase."""
        statuses = {}
        current = self._get_current_phase(state)
        for i in range(1, 11):
            if i < current:
                statuses[i] = "completed"
            elif i == current:
                statuses[i] = "in_progress"
            else:
                statuses[i] = "pending"
        return statuses

    def do_POST(self):
        if self.path == '/api/answer':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)

            try:
                answer_data = json.loads(post_data.decode('utf-8'))
                answer_data['submitted_at'] = datetime.now().isoformat()

                # Write answer to pending file
                answer_file = self.get_project_dir() / ANSWER_FILE
                answer_file.parent.mkdir(parents=True, exist_ok=True)
                answer_file.write_text(json.dumps(answer_data, indent=2))

                # Clear the question file
                question_file = self.get_project_dir() / QUESTION_FILE
                if question_file.exists():
                    question_file.unlink()

                # Log activity
                self._log_activity(f"Answer submitted: {answer_data.get('answer', '')[:50]}")

                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success"}).encode('utf-8'))

            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def _log_activity(self, message):
        """Add entry to activity log."""
        activity_file = self.get_project_dir() / ACTIVITY_LOG_FILE
        activity_file.parent.mkdir(parents=True, exist_ok=True)

        entries = []
        if activity_file.exists():
            try:
                data = json.loads(activity_file.read_text())
                entries = data.get('entries', data) if isinstance(data, dict) else data
            except Exception:
                pass

        entries.append({
            "time": datetime.now().isoformat(),
            "message": message
        })
        entries = entries[-50:]  # Keep last 50

        activity_file.write_text(json.dumps({"entries": entries}, indent=2))

    def log_message(self, format, *args):
        # Custom log format
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {args[0]}")


def main():
    # Get port from argument or environment
    port = DEFAULT_PORT
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    port = int(os.environ.get('REMOTE_QUESTIONS_PORT', port))

    project_dir = os.environ.get('CLAUDE_PROJECT_DIR', '.')

    # Ensure directories exist
    claude_dir = Path(project_dir) / ".claude"
    claude_dir.mkdir(parents=True, exist_ok=True)
    (Path(project_dir) / ".claude/workflow-logs").mkdir(parents=True, exist_ok=True)

    server = HTTPServer(('0.0.0.0', port), QuestionHandler)

    print(f"""
================================================================================
                    HUSTLE BUILD DASHBOARD SERVER v4.6.1
================================================================================

Dashboard running at: http://localhost:{port}

Features:
  - Build progress & phase status
  - Question interface for remote answering
  - Build queue with dependencies
  - Activity log
  - Browser notifications (click Enable in header)

Access from phone/tablet on same network:
    http://<your-computer-ip>:{port}
    (Find IP: ipconfig/ifconfig, look for 192.168.x.x)

API Endpoints:
    GET  /           - Full dashboard HTML
    GET  /api/status - Build state JSON
    GET  /api/question - Current question JSON
    POST /api/answer   - Submit answer

Project directory: {os.path.abspath(project_dir)}

Press Ctrl+C to stop.
================================================================================
""")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
        server.shutdown()


if __name__ == "__main__":
    main()
