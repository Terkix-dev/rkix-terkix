/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Terminal as TerminalIcon, 
  Cpu, 
  HardDrive, 
  GitBranch, 
  Globe, 
  Activity, 
  Zap, 
  ShieldAlert, 
  Layers, 
  Search, 
  Plus, 
  Trash2, 
  FolderGit2, 
  Check, 
  ExternalLink, 
  FileCode2, 
  Code, 
  Settings, 
  Play, 
  Send, 
  RefreshCw, 
  Sliders, 
  UserCog, 
  FolderPlus, 
  Save, 
  ChevronRight, 
  AlertTriangle,
  PlayCircle,
  Clock,
  ExternalLink as LinkIcon,
  Users,
  Puzzle,
  MessageSquare,
  HelpCircle,
  Menu,
  X,
  Mic,
  MicOff,
  BookOpen,
  Package
} from "lucide-react";
import { Project, WorkspaceFile, Agent, TerminalLine, Deployment, GitCommit } from "./types";
import { Analytics } from "@vercel/analytics/react";
import { readJsonStorage, readNumberStorage, readStringStorage, writeStorage } from "./utils/storage";
import { PRESET_PROJECTS } from "./data/presets";
import DashboardOverview from "./components/DashboardOverview";
import ProjectList from "./components/ProjectList";
import ContactsManager, { Contact } from "./components/ContactsManager";
import PluginManager, { CustomPlugin } from "./components/PluginManager";
import TelemetryD3Chart from "./components/TelemetryD3Chart";
import CommunityPage from "./components/CommunityPage";
import LibraryRegistry from "./components/LibraryRegistry";
import IntegrationsPage from "./components/IntegrationsPage";
import DomainToolsPage from "./components/DomainToolsPage";
import { TerKixMark, TerKixBadge } from "./components/TerKixLogo";

const DEFAULT_AGENTS: Agent[] = [
  { id: "planner", name: "Planner Agent", role: "Planner", description: "Requirement analysis, task decomposition, and workflow plan generation.", status: "idle", lastAction: "Standby.", color: "bg-[#58A6FF]" },
  { id: "builder", name: "Builder Agent", role: "Builder", description: "Source code generation, project scaffolding, and system initialization.", status: "idle", lastAction: "Standby.", color: "bg-[#F0883E]" },
  { id: "designer", name: "Designer Agent", role: "Designer", description: "UI generation, component creation, interactive pacing, and style refinements.", status: "idle", lastAction: "Standby.", color: "bg-[#3FB950]" },
  { id: "debugger", name: "Debugger Agent", role: "Debugger", description: "TypeScript linting checks, type validation, and logical bug detection.", status: "idle", lastAction: "Standby.", color: "bg-[#D29922]" },
  { id: "deploy", name: "Deploy Agent", role: "Deploy", description: "Build compilation pipelines, artifact compression, and cloud link synchronization.", status: "idle", lastAction: "Standby.", color: "bg-[#BC8CFF]" },
  { id: "research", name: "Research Agent", role: "Research", description: "Documentation searching and optimal code practice recommendations.", status: "idle", lastAction: "Standby.", color: "bg-[#4AF626]" }
];

const INITIAL_LINES: TerminalLine[] = [
  { id: "init-1", type: "system", text: "TerKix Terminal OS [Version 1.0.4] - Secure Dev Kernel", timestamp: new Date().toLocaleTimeString() },
  { id: "init-2", type: "system", text: "Initializing isolated multi-agent software sandboxes...", timestamp: new Date().toLocaleTimeString() },
  { id: "init-3", type: "success", text: "Core kernel boot completed inside micro-container in 12ms.", timestamp: new Date().toLocaleTimeString() },
  { id: "init-4", type: "agent-info", text: "[PLANNER] Directives compiled. Ready for requirements parsing.", timestamp: new Date().toLocaleTimeString(), agent: "Planner" },
  { id: "init-5", type: "agent-info", text: "[BUILDER] Scaffolding matrices loaded. Standby state verified.", timestamp: new Date().toLocaleTimeString(), agent: "Builder" },
  { id: "init-6", type: "agent-success", text: "All 6 autonomous agents registered and synchronized.", timestamp: new Date().toLocaleTimeString(), agent: "Designer" },
  { id: "init-7", type: "warning", text: "Type 'help' to review TerKix custom terminal commands or enter a natural prompt to spawn assets.", timestamp: new Date().toLocaleTimeString() },
];

export default function App() {
  const terkixRootRef = useRef<HTMLDivElement>(null);

  // Persistence state loaders
  const [projects, setProjects] = useState<Project[]>(() =>
    readJsonStorage<Project[]>("terkix_projects", PRESET_PROJECTS, (value): value is Project[] =>
      Array.isArray(value) && value.every((item) => typeof item?.id === "string" && Array.isArray(item?.files))
    )
  );

  const [activeProjectId, setActiveProjectId] = useState<string>(() =>
    readStringStorage("terkix_active_project_id", PRESET_PROJECTS[0]?.id || "")
  );

  const [currentSection, setCurrentSection] = useState<string>("terminal");
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>(() =>
    readJsonStorage<TerminalLine[]>("terkix_terminal_lines", INITIAL_LINES, (value): value is TerminalLine[] =>
      Array.isArray(value) && value.every((item) => typeof item?.id === "string" && typeof item?.text === "string")
    )
  );

  const [agents, setAgents] = useState<Agent[]>(DEFAULT_AGENTS);
  const [commandText, setCommandText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [totalCommandsRun, setTotalCommandsRun] = useState<number>(() =>
    readNumberStorage("terkix_total_commands", 0)
  );

  // File explorer states
  const [selectedFilePath, setSelectedFilePath] = useState<string>("");
  const [isEditingFile, setIsEditingFile] = useState<boolean>(false);
  const [editedCode, setEditedCode] = useState<string>("");
  const [mobileFileTreeOpen, setMobileFileTreeOpen] = useState<boolean>(false);

  // Terminal and Live Chat scroll boxes
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const terminalScrollRef = useRef<boolean>(true);

  // AI Thinking Mode state
  const [thinkingMode, setThinkingMode] = useState<boolean>(false);
  const [detailedReasoningText, setDetailedReasoningText] = useState<string>("");

  // Assistive Touch home button state additions
  const [showContext, setShowContext] = useState<boolean>(false);
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [longPressedTriggered, setLongPressedTriggered] = useState<boolean>(false);

  const startLongPressTimer = () => {
    setLongPressedTriggered(false);
    longPressTimerRef.current = setTimeout(() => {
      setLongPressedTriggered(true);
      setShowContext(true);
    }, 500); // 500ms long press threshold
  };

  const clearLongPressTimer = (e: React.MouseEvent | React.TouchEvent, isClickAction: boolean) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    if (isClickAction && !longPressedTriggered) {
      // Toggle nav
      setIsNavOpen(prev => {
        const nextState = !prev;
        if (!nextState) {
          setCurrentSection("terminal");
        }
        return nextState;
      });
    }
    setLongPressedTriggered(false);
  };

  const toggleMicrophone = async () => {
    if (isMicActive) {
      if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
      }
      setMicStream(null);
      setIsMicActive(false);
      
      const timeStr = new Date().toLocaleTimeString();
      setTerminalLines(prev => [
        ...prev,
        {
          id: `mic-${Date.now()}`,
          type: "system",
          text: "System notification: Microphone input stream has been safely deactivated.",
          timestamp: timeStr
        }
      ]);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicStream(stream);
        setIsMicActive(true);
        
        const timeStr = new Date().toLocaleTimeString();
        setTerminalLines(prev => [
          ...prev,
          {
            id: `mic-${Date.now()}`,
            type: "success",
            text: "Voice acquisition online: Live audio capture stream established. Mic permission granted.",
            timestamp: timeStr
          }
        ]);
      } catch (err: any) {
        console.warn("Unable to establish live microphone feed directly: ", err);
        setIsMicActive(true);
        
        const timeStr = new Date().toLocaleTimeString();
        setTerminalLines(prev => [
          ...prev,
          {
            id: `mic-${Date.now()}`,
            type: "warning",
            text: `Voice simulated (Dev environment fallback): Live mic active indicator is now pulsing red!`,
            timestamp: timeStr
          }
        ]);
      }
    }
  };

  // Check microphone permissions
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: "microphone" as PermissionName })
        .then((permissionStatus) => {
          const handlePermissionChange = () => {
            if (permissionStatus.state === "denied") {
              if (isMicActive) {
                if (micStream) micStream.getTracks().forEach(t => t.stop());
                setMicStream(null);
                setIsMicActive(false);
              }
            }
          };
          permissionStatus.onchange = handlePermissionChange;
        })
        .catch(err => console.debug("Permissions query not supported: ", err));
    }
  }, [isMicActive, micStream]);

  // Termux UI responsive states
  const [isNavOpen, setIsNavOpen] = useState<boolean>(false);
  const [consoleFontSize, setConsoleFontSize] = useState<"sm" | "base" | "lg">("base");
  const [themeColor, setThemeColor] = useState<"green" | "amber" | "cyan" | "violet">("green");
  const [showLegacySidebar, setShowLegacySidebar] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [crtFilter, setCrtFilter] = useState<boolean>(false);

  // Real-time Telemetry metrics history
  const [telemetryHistory, setTelemetryHistory] = useState<{ cpu: number; ping: number }[]>(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      cpu: Number((1.5 + Math.random() * 2).toFixed(2)),
      ping: Number((1.2 + Math.random() * 1.5).toFixed(2))
    }));
  });

  // Contacts & Collaborators states
  const [activeCollaborators, setActiveCollaborators] = useState<Contact[]>([
    {
      resourceName: "people/c1",
      name: "Nguyễn Văn Hùng",
      email: "hung.nguyen@terkix.dev",
      phone: "+84 901 234 567",
      role: "Lead Architect",
      isCollaborating: true
    },
    {
      resourceName: "people/c2",
      name: "Trần Thị Mai",
      email: "mai.tran@terkix.dev",
      phone: "+84 912 345 678",
      role: "Designer Agent",
      isCollaborating: true
    }
  ]);

  // Custom Plugins state
  const [customPlugins, setCustomPlugins] = useState<CustomPlugin[]>([
    {
      id: "plugin-1",
      name: "Git Revision Sync",
      type: "command",
      triggerCommand: "gitsync",
      responseOutput: "[GIT SYNC] Matching revisions across active container tags. Local HEAD and origin master references are completely synced in 25ms.",
      isEnabled: true
    },
    {
      id: "plugin-2",
      name: "Cyberpunk Glow-up UI",
      type: "command",
      triggerCommand: "neonmode",
      responseOutput: "[NEON GLOW] High-frequency violet shadows and neon accents successfully registered under css components.",
      isEnabled: true
    },
    {
      id: "plugin-3",
      name: "Standard Uptime",
      type: "command",
      triggerCommand: "uptime",
      responseOutput: "[SYSTEM STATUS] TerKix Terminal OS uptime: 14h 32m 11s. Core server container response delay: 2.13ms.",
      isEnabled: true
    }
  ]);

  // Terminal Tab view toggle (shell CLI vs collaborator chat)
  const [terminalViewMode, setTerminalViewMode] = useState<"shell" | "chat">("shell");
  
  // Real-time chat threads
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    sender: string;
    role?: string;
    avatar?: string;
    text: string;
    timestamp: string;
    isAgent?: boolean;
  }>>([
    {
      id: "msg-1",
      sender: "Nguyên Văn Hùng",
      role: "Lead Architect",
      text: "Xin chào cả đội! Tôi đã chuẩn bị xong môi trường biên dịch cho dự án mới.",
      timestamp: "10:15 AM"
    },
    {
      id: "msg-2",
      sender: "Trần Thị Mai",
      role: "Designer Agent",
      text: "Tuyệt quá! Hôm nay chúng ta sẽ bắt đầu thiết kế thêm một số module giao diện bento grid nhé.",
      timestamp: "10:16 AM"
    },
    {
      id: "msg-3",
      sender: "Designer Agent",
      role: "Designer",
      text: "I am ready too! Custom CSS layouts and viewport triggers can be generated instantly inside index.html.",
      timestamp: "10:18 AM",
      isAgent: true
    }
  ]);
  const [chatInput, setChatInput] = useState<string>("");

  // Dynamically computed agents based on enabled custom agent plugins
  const customAgentPlugins = customPlugins.filter(p => p.isEnabled && p.type === "agent");
  const computedAgents = [
    ...agents,
    ...customAgentPlugins.map(p => ({
      id: p.id,
      name: `${p.agentRole} Agent`,
      role: p.agentRole || "Specialist",
      description: p.agentDesc || "Custom developer plugin agent.",
      status: "idle" as const,
      lastAction: "Standby under Plugin directives.",
      color: "bg-[#BC8CFF]"
    }))
  ];

  // Helper callbacks
  const handleAddCollaborator = (newContact: Contact, roleAssigned: string) => {
    setActiveCollaborators(prev => {
      if (prev.some(c => c.email === newContact.email)) {
        return prev.map(c => c.email === newContact.email ? { ...c, role: roleAssigned, isCollaborating: true } : c);
      }
      return [...prev, { ...newContact, role: roleAssigned, isCollaborating: true }];
    });
  };

  const handleAddPlugin = (plugin: CustomPlugin) => {
    setCustomPlugins(prev => [plugin, ...prev]);
  };

  const handleDeletePlugin = (id: string) => {
    setCustomPlugins(prev => prev.filter(p => p.id !== id));
  };

  const handleTogglePlugin = (id: string) => {
    setCustomPlugins(prev => prev.map(p => p.id === id ? { ...p, isEnabled: !p.isEnabled } : p));
  };

  const handleSendChatMessage = () => {
    const textClean = chatInput.trim();
    if (!textClean) return;

    const userMsg = {
      id: "user-msg-" + Date.now(),
      sender: "You (nvht2505@gmail.com)",
      role: "Lead Developer",
      text: textClean,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");

    // Simulate multi-user collaborator reactions based on user text keywords
    setTimeout(() => {
      let replyText = "Đã rõ! Tôi nghĩ cấu trúc này khá phù hợp. Hãy kiểm tra biên dịch và chạy thử nhé.";
      let responder = activeCollaborators[Math.floor(Math.random() * activeCollaborators.length)] || { name: "Nguy��n Văn Hùng", role: "Lead Architect" };

      if (textClean.toLowerCase().includes("css") || textClean.toLowerCase().includes("style") || textClean.toLowerCase().includes("màu") || textClean.toLowerCase().includes("giao diện")) {
        responder = activeCollaborators.find(c => c.role?.includes("Designer") || c.role?.includes("Artisan") || c.name.includes("Mai")) || { name: "Trần Thị Mai", role: "Designer Agent" };
        replyText = "Hợp lý đấy! Tôi vừa phác thảo một bản vẽ layout có tích hợp hiệu ứng gradient bóng bẩy. Đội thiết kế duyệt chưa?";
      } else if (textClean.toLowerCase().includes("deploy") || textClean.toLowerCase().includes("chạy") || textClean.toLowerCase().includes("lên")) {
        replyText = "Hệ thống biên dịch đã sẵn sàng. Hãy gõ lệnh 'deploy' ở Terminal để nạp gói cài đặt lên Vercel nhé.";
      } else if (textClean.toLowerCase().includes("gitsync") || textClean.toLowerCase().includes("plugin")) {
        replyText = "Tôi vừa kiểm tra tab Plugin Hub. Các câu lệnh mở rộng đã nạp và được theo dõi trong kernel OS rồi.";
      }

      setChatMessages(prev => [
         ...prev,
         {
           id: "reply-" + Date.now(),
           sender: responder.name,
           role: responder.role,
           text: replyText,
           timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
         }
      ]);
    }, 1200);
  };

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || PRESET_PROJECTS[0];

  useEffect(() => {
    if (projects.length === 0) {
      setProjects(PRESET_PROJECTS);
      setActiveProjectId(PRESET_PROJECTS[0]?.id || "");
      return;
    }

    if (!projects.some((project) => project.id === activeProjectId)) {
      setActiveProjectId(projects[0].id);
    }
  }, [activeProjectId, projects]);

  useEffect(() => {
    writeStorage("terkix_projects", projects);
  }, [projects]);

  useEffect(() => {
    writeStorage("terkix_active_project_id", activeProjectId);
    if (activeProject && activeProject.files.length > 0) {
      setSelectedFilePath((current) =>
        activeProject.files.some((file) => file.path === current) ? current : activeProject.files[0].path
      );
    }
  }, [activeProjectId, activeProject]);

  useEffect(() => {
    writeStorage("terkix_terminal_lines", terminalLines);
  }, [terminalLines]);

  useEffect(() => {
    writeStorage("terkix_total_commands", totalCommandsRun.toString());
  }, [totalCommandsRun]);

  // Update Real-time Telemetry Metrics periodically to drive live D3 visualizations
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryHistory(prev => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        // realistic brownian noise crawl of CPU load (0.5% - 8.5%) and ping matrix (0.8ms - 5.5ms)
        const changeCpu = (Math.random() - 0.5) * 0.98;
        const nextCpu = Math.max(0.6, Math.min(8.5, Number((last.cpu + changeCpu).toFixed(2))));
        
        const changePing = (Math.random() - 0.5) * 0.45;
        const nextPing = Math.max(0.8, Math.min(5.5, Number((last.ping + changePing).toFixed(2))));
        
        return [...prev.slice(1), { cpu: nextCpu, ping: nextPing }];
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Handle selected file change
  useEffect(() => {
    if (activeProject) {
      const activeFile = activeProject.files.find(f => f.path === selectedFilePath);
      if (activeFile) {
        setEditedCode(activeFile.content);
      } else if (activeProject.files.length > 0) {
        setSelectedFilePath(activeProject.files[0].path);
        setEditedCode(activeProject.files[0].content);
      }
    }
  }, [selectedFilePath, activeProject]);

  useEffect(() => {
    // Reset our manual scroll tracking bypass anytime a background AI pipeline builds/starts
    if (isProcessing) {
      terminalScrollRef.current = true;
    }
  }, [isProcessing]);

  useEffect(() => {
    // Scroll dynamically ONLY while AI is processing/broadcasting, or when user has just sent an active input command
    const lastLine = terminalLines[terminalLines.length - 1];
    const isInputType = lastLine?.type === "input";
    
    if (terminalScrollRef.current && (isProcessing || isInputType) && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalLines, isProcessing]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, currentSection]);

  // Handle Termux custom interactive key modifiers
  const handleTermKeyAction = (action: string) => {
    if (action === "ESC") {
      setCommandText("");
    } else if (action === "TAB") {
      const txt = commandText.trim().toLowerCase();
      if (!txt) {
        setCommandText("help");
      } else if ("clear".startsWith(txt)) {
        setCommandText("clear");
      } else if ("create".startsWith(txt)) {
        setCommandText("create ");
      } else if ("delete".startsWith(txt)) {
        setCommandText("delete ");
      } else if ("deploy".startsWith(txt)) {
        setCommandText("deploy");
      } else if ("git commit".startsWith(txt)) {
        setCommandText("git commit ");
      } else if ("git branch".startsWith(txt)) {
        setCommandText("git branch ");
      } else if ("gitsync".startsWith(txt)) {
        setCommandText("gitsync");
      } else if ("neonmode".startsWith(txt)) {
        setCommandText("neonmode");
      } else if ("uptime".startsWith(txt)) {
        setCommandText("uptime");
      }
    } else if (action === "CTRL") {
      setCrtFilter(prev => !prev);
      setTerminalLines(prev => [
        ...prev,
        { id: `crt-${Date.now()}`, type: "system", text: `[MONITOR] CRT Scanline phosphor overlay: ${!crtFilter ? "ACTIVATED" : "DEACTIVATED"}`, timestamp: new Date().toLocaleTimeString() }
      ]);
    } else if (action === "ALT") {
      const themes: Array<"green" | "amber" | "cyan" | "violet"> = ["green", "amber", "cyan", "violet"];
      const nextTheme = themes[(themes.indexOf(themeColor) + 1) % themes.length];
      setThemeColor(nextTheme);
      setTerminalLines(prev => [
        ...prev,
        { id: `theme-${Date.now()}`, type: "system", text: `[CONSOLE] Phosphor matrix shifted to retro ${nextTheme.toUpperCase()}`, timestamp: new Date().toLocaleTimeString() }
      ]);
    } else if (action === "-") {
      if (consoleFontSize === "lg") setConsoleFontSize("base");
      else if (consoleFontSize === "base") setConsoleFontSize("sm");
    } else if (action === "+") {
      if (consoleFontSize === "sm") setConsoleFontSize("base");
      else if (consoleFontSize === "base") setConsoleFontSize("lg");
    } else if (action === "CLEAR") {
      setTerminalLines([]);
    } else if (action === "PGUP") {
      if (terminalEndRef.current) {
        terminalEndRef.current.parentNode?.dispatchEvent(new CustomEvent('scroll-up'));
        // Fallback smooth scroll
        const p = terminalEndRef.current.parentElement;
        if (p) {
          p.scrollTop -= 200;
          // Temporarily pause auto-scrolling due to manual scrolling up
          terminalScrollRef.current = false;
        }
      }
    } else if (action === "PGDN") {
      if (terminalEndRef.current) {
        const p = terminalEndRef.current.parentElement;
        if (p) {
          p.scrollTop += 200;
          const isAtBottom = p.scrollHeight - p.scrollTop - p.clientHeight < 80;
          terminalScrollRef.current = isAtBottom;
        }
      }
    }
  };

  // Execute terminal shell command pipeline
  const handleCommandSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCmd = commandText.trim();
    if (!cleanCmd) return;

    setCommandText("");
    
    // Add prompt user input visual line to terminal console
    const inputTimestamp = new Date().toLocaleTimeString();
    const userLineId = `cmd-${Date.now()}`;
    setTerminalLines(prev => [
      ...prev,
      { id: userLineId, type: "input", text: cleanCmd, timestamp: inputTimestamp }
    ]);
    
    setTotalCommandsRun(c => c + 1);

    // Check pre-configured helper commands
    const parts = cleanCmd.split(" ");
    const primaryCmd = parts[0].toLowerCase();

    // Custom Plugin Command Interceptor
    const matchedPlugin = customPlugins.find(p => p.isEnabled && p.type === "command" && p.triggerCommand === primaryCmd);
    if (matchedPlugin) {
      setIsProcessing(true);
      setTerminalLines(prev => [
        ...prev,
        {
          id: `plugin-trigger-${Date.now()}`,
          type: "system",
          text: `[PLUGIN: ${matchedPlugin.name}] Kích hoạt thành công... Trực quan phản hồi từ câu lệnh:`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);

      setTimeout(() => {
        setTerminalLines(prev => [
          ...prev,
          {
            id: `plugin-resp-${Date.now()}`,
            type: "success",
            text: matchedPlugin.responseOutput,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
        setIsProcessing(false);
      }, 700);
      return;
    }

    if (primaryCmd === "clear") {
      setTerminalLines([]);
      return;
    }

    if (primaryCmd === "help") {
      const respId = `help-${Date.now()}`;
      setTerminalLines(prev => [
        ...prev,
        {
          id: respId,
          type: "system",
          text: `\nTerKix Command Line Reference Guide:\n` +
                `---------------------------------------------------------------------------------\n` +
                `$ clear                   - Flush clean the active console log stream.\n` +
                `$ help                    - Display this system reference manual.\n` +
                `$ create <filename>       - Scaffold a new empty file in active workspace.\n` +
                `$ delete <filename>       - Remove specified file resource safely.\n` +
                `$ git commit <message>    - Snapshot compile current work onto active ledger.\n` +
                `$ git branch <name>       - Fork a virtual timeline branch.\n` +
                `$ deploy                  - Trigger production build pack & verify live routing.\n` +
                `---------------------------------------------------------------------------------\n` +
                `Natural Language Prompts:\n` +
                `Enter standard specifications (e.g. "build a task tracker with status badges" or\n` +
                `"modify navbar on the portfolio to have violet glowing effects") to coordinate your\n` +
                `autonomous multi-agent developer system. Outputs are compiled live in real-time.`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
      return;
    }

    if (primaryCmd === "create" && parts[1]) {
      const fileName = parts[1];
      const filePath = `workspace/project/${fileName}`;
      const ext = fileName.split(".").pop() || "txt";
      
      const newFile: WorkspaceFile = {
        path: filePath,
        name: fileName,
        content: `<!-- Created inside ${activeProject.name} workspace -->\n<div class="p-6 bg-slate-900 rounded">\n  <h2 class="text-white font-bold">${fileName} Module Ready</h2>\n</div>`,
        language: ext === "tsx" || ext === "ts" ? "tsx" : ext === "html" ? "html" : "css"
      };

      setProjects(prev => prev.map(p => {
        if (p.id === activeProject.id) {
          // Check if already exists
          if (p.files.some(f => f.path === filePath)) return p;
          return { ...p, files: [...p.files, newFile] };
        }
        return p;
      }));

      setSelectedFilePath(filePath);
      setTerminalLines(prev => [
        ...prev,
        { id: `create-suc-${Date.now()}`, type: "success", text: `[SYSTEM] Successfully initialized space target: ${filePath}`, timestamp: new Date().toLocaleTimeString() }
      ]);
      return;
    }

    if (primaryCmd === "delete" && parts[1]) {
      const fileName = parts[1];
      const filePath = `workspace/project/${fileName}`;
      
      setProjects(prev => prev.map(p => {
        if (p.id === activeProject.id) {
          return { ...p, files: p.files.filter(f => f.path !== filePath && f.name !== fileName) };
        }
        return p;
      }));

      setTerminalLines(prev => [
        ...prev,
        { id: `delete-suc-${Date.now()}`, type: "success", text: `[SYSTEM] Resource removed safely: ${filePath}`, timestamp: new Date().toLocaleTimeString() }
      ]);
      return;
    }

    if (primaryCmd === "git" && parts[1] === "commit") {
      const commitMsg = parts.slice(2).join(" ") || "Snapshot incremental backup update";
      const newCommit: GitCommit = {
        hash: Math.random().toString(16).slice(2, 9),
        message: commitMsg.replace(/['"]/g, ""),
        author: "nvht2505@gmail.com <TerKix Console>",
        date: new Date().toISOString()
      };

      setProjects(prev => prev.map(p => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            commitHistory: [newCommit, ...p.commitHistory]
          };
        }
        return p;
      }));

      setTerminalLines(prev => [
        ...prev,
        { id: `commit-suc-${Date.now()}`, type: "success", text: `[GIT] Created save snapshot commit [${newCommit.hash}]: ${newCommit.message}`, timestamp: new Date().toLocaleTimeString() }
      ]);
      return;
    }

    if (primaryCmd === "git" && parts[1] === "branch" && parts[2]) {
      const branchName = parts[2];
      
      setProjects(prev => prev.map(p => {
        if (p.id === activeProject.id) {
          if (p.branches.some(b => b.name === branchName)) return p;
          return {
            ...p,
            branches: [...p.branches, { name: branchName, isCurrent: false }]
          };
        }
        return p;
      }));

      setTerminalLines(prev => [
        ...prev,
        { id: `branch-suc-${Date.now()}`, type: "success", text: `[GIT] Branch initialized successfully: '${branchName}'`, timestamp: new Date().toLocaleTimeString() }
      ]);
      return;
    }

    if (primaryCmd === "deploy") {
      setIsProcessing(true);
      
      // Cascade automated build and deploy logs
      setTerminalLines(prev => [
        ...prev,
        { id: `dp-1-${Date.now()}`, type: "system", text: `[DEPLOY] Triggering automated build pipeline pack on current snapshot...`, timestamp: new Date().toLocaleTimeString() },
      ]);

      setTimeout(() => {
        setTerminalLines(prev => [
          ...prev,
          { id: `dp-2-${Date.now()}`, type: "system", text: `[DEPLOY] Executing npm run build: production configuration targets...`, timestamp: new Date().toLocaleTimeString() },
          { id: `dp-3-${Date.now()}`, type: "success", text: `[DEPLOY] Vercel edge runtime bundle generated size: 142KB [Success]`, timestamp: new Date().toLocaleTimeString() },
        ]);

        const randomHash = Math.random().toString(16).slice(2, 9);
        const newDeployment: Deployment = {
          id: `dep-${Date.now()}`,
          provider: "Vercel",
          status: "live",
          url: `https://${activeProject.id}-${randomHash}.vercel.app`,
          branch: activeProject.activeBranch,
          createdAt: new Date().toISOString(),
          commitHash: activeProject.commitHistory[0]?.hash || "a4c28f1"
        };

        setProjects(prev => prev.map(p => {
          if (p.id === activeProject.id) {
            return {
              ...p,
              deployments: [newDeployment, ...p.deployments]
            };
          }
          return p;
        }));

        setTerminalLines(prev => [
          ...prev,
          { id: `dp-4-${Date.now()}`, type: "agent-success", text: `[DEPLOY] Production successfully live: ${newDeployment.url}`, timestamp: new Date().toLocaleTimeString() },
        ]);

        setIsProcessing(false);
      }, 1500);

      return;
    }

    // NATURAL LANGUAGE PROMPTS - EXECUTE GEMINI AGENT STACK OR FALLBACK SIMULATOR
    setIsProcessing(true);
    
    // Animate agents cascading startup logs
    setAgents(prev => prev.map(a => a.id === "planner" ? { ...a, status: "running", lastAction: "Analyzing prompt directives..." } : a));
    
    setTerminalLines(prev => [
      ...prev,
      { id: `gem-1-${Date.now()}`, type: "agent-info", text: `[PLANNER] Analyzing command instructions: "${cleanCmd}"`, timestamp: new Date().toLocaleTimeString(), agent: "Planner" }
    ]);

    try {
      // Directives cascade
      if (thinkingMode) {
        setTerminalLines(prev => [
          ...prev,
          { id: `thinking-trace-1-${Date.now()}`, type: "system", text: `[THINKING PROCESS] Chế độ suy nghĩ bậc cao được kích hoạt. Đang xây dựng cấu trúc logic & quy chuẩn an toàn...`, timestamp: new Date().toLocaleTimeString() }
        ]);
        await new Promise(r => setTimeout(r, 1200));
      }

      const response = await fetch("/api/gemini/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: cleanCmd,
          currentFiles: activeProject.files,
          projectContext: {
            name: activeProject.name,
            description: activeProject.description
          },
          activeBranch: activeProject.activeBranch,
          thinkingMode: thinkingMode
        })
      });

      if (!response.ok) {
        throw new Error("Local Gemini server processed with error. Activating offline smart simulator engine.");
      }

      const data = await response.json();
      
      // Store reasoning trace
      if (data.detailedReasoning) {
        setDetailedReasoningText(data.detailedReasoning);
      } else {
        setDetailedReasoningText("");
      }
      
      // Coordinate agent cascade visualization
      executeAgentLogsCascade(data);

    } catch (err: any) {
      console.warn("API Error, utilizing simulator fallback:", err);
      // Run fallback smart simulator so the app is always functional and visually satisfying
      generateSimulatorFallback(cleanCmd);
    }
  };

  // Animate the multi-agent cascade response step-by-step
  const executeAgentLogsCascade = (data: any) => {
    const { agentWorkflow, workspaceChanges, terminalOutput, explanation } = data;
    
    // Clear and execute cascade animation with timeouts
    let timer = 200;

    agentWorkflow.forEach((wf: any, i: number) => {
      setTimeout(() => {
        // Set agent states
        const normalizedRole = wf.agent.toLowerCase();
        setAgents(prev => prev.map(a => {
          if (a.role.toLowerCase() === normalizedRole) {
            return { ...a, status: "running", lastAction: wf.action };
          }
          return { ...a, status: "idle" };
        }));

        setTerminalLines(prev => [
          ...prev,
          {
            id: `wf-step-${Date.now()}-${i}`,
            type: normalizedRole === "debugger" ? "warning" : normalizedRole === "deploy" ? "success" : "agent-info",
            text: `[${wf.agent.toUpperCase()}] ${wf.action} \n--> ${wf.log}`,
            timestamp: new Date().toLocaleTimeString(),
            agent: wf.agent
          }
        ]);
      }, timer);
      timer += 1000;
    });

    // Write terminal logs & apply workspace changes after cascade complete
    setTimeout(() => {
      // Return agents to standby
      setAgents(prev => prev.map(a => ({ ...a, status: "idle", lastAction: "Directives completed successfully." })));

      // Render custom terminal outputs
      if (terminalOutput) {
        setTerminalLines(prev => [
          ...prev,
          {
            id: `term-out-${Date.now()}`,
            type: "system",
            text: terminalOutput,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      }

      // Summarize explanation
      setTerminalLines(prev => [
        ...prev,
        {
          id: `expl-${Date.now()}`,
          type: "agent-success",
          text: `[SYSTEM] Agent stack finished the project task: ${explanation}`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);

      // Apply workspace changes to the state
      setProjects(prev => prev.map(p => {
        if (p.id === activeProject.id) {
          let updatedFiles = [...p.files];

          // 1. Process deletions
          if (workspaceChanges.filesToDelete && workspaceChanges.filesToDelete.length > 0) {
            updatedFiles = updatedFiles.filter(f => !workspaceChanges.filesToDelete.includes(f.path) && !workspaceChanges.filesToDelete.includes(f.name));
          }

          // 2. Process edits
          if (workspaceChanges.filesToEdit && workspaceChanges.filesToEdit.length > 0) {
            workspaceChanges.filesToEdit.forEach((ed: any) => {
              const idx = updatedFiles.findIndex(f => f.path === ed.path || f.name === ed.path);
              if (idx !== -1) {
                updatedFiles[idx] = { ...updatedFiles[idx], content: ed.content };
              }
            });
          }

          // 3. Process creations
          if (workspaceChanges.filesToCreate && workspaceChanges.filesToCreate.length > 0) {
            workspaceChanges.filesToCreate.forEach((cr: any) => {
              const idx = updatedFiles.findIndex(f => f.path === cr.path);
              if (idx !== -1) {
                updatedFiles[idx] = {
                  path: cr.path,
                  name: cr.name || cr.path.split("/").pop() || "unnamed",
                  content: cr.content,
                  language: cr.language || "typescript"
                };
              } else {
                updatedFiles.push({
                  path: cr.path,
                  name: cr.name || cr.path.split("/").pop() || "unnamed",
                  content: cr.content,
                  language: cr.language || cr.path.split(".").pop() || "typescript"
                });
              }
            });
          }

          return { ...p, files: updatedFiles };
        }
        return p;
      }));

      setIsProcessing(false);
    }, timer);
  };

  // Generate simulated offline actions when keys are absent
  const generateSimulatorFallback = (prompt: string) => {
    // Generate a beautiful landing page template or change style based on keywords
    const isSaaSPrompt = prompt.toLowerCase().includes("saas") || prompt.toLowerCase().includes("landing") || prompt.toLowerCase().includes("bento");
    const isRetroPrompt = prompt.toLowerCase().includes("retro") || prompt.toLowerCase().includes("violet") || prompt.toLowerCase().includes("glow") || prompt.toLowerCase().includes("neon");
    const isComponent = prompt.toLowerCase().includes("navbar") || prompt.toLowerCase().includes("button") || prompt.toLowerCase().includes("hero");

    if (thinkingMode) {
      const reasoningSnippet = 
        `### [BẢN PHÂN TÍCH SUY NGHĨ KHUYẾN KHÍCH TƯ DUY BẬC CAO (OFFLINE)]\n` +
        `**Yêu cầu xử lý:** "${prompt}"\n\n` +
        `#### 1. Mô hình hóa Thẩm mỹ & Giao diện (Designer Agent)\n` +
        `- Phác thảo mật độ tương phản: Áp dụng màu nền Dark Slate sâu và bo tròn card.\n` +
        `- Cân đối kích thước touch targets tối thiểu 44px phục vụ tối đa cho mobile.\n\n` +
        `#### 2. Kế hoạch Scaffolding & Type Safety (Builder Agent)\n` +
        `- Khai báo cấu trúc tệp an toàn, nạp liên hoàn tailwind css components.\n` +
        `- Viết mã nguồn hoàn chỉnh không chứa comment rỗng làm rào cản.`;
      setDetailedReasoningText(reasoningSnippet);
    } else {
      setDetailedReasoningText("");
    }

    setTimeout(() => {
      setAgents(prev => prev.map(a => a.id === "builder" ? { ...a, status: "running", lastAction: "Simulating file generation..." } : a));
      setTerminalLines(prev => [
        ...prev,
        { id: `sim-2-${Date.now()}`, type: "agent-info", text: `[BUILDER] Scaffold target created. Injecting customized components...`, timestamp: new Date().toLocaleTimeString(), agent: "Builder" }
      ]);
    }, 600);

    setTimeout(() => {
      setAgents(prev => prev.map(a => a.id === "designer" ? { ...a, status: "running", lastAction: "Refining visual layouts and colors..." } : a));
      setTerminalLines(prev => [
        ...prev,
        { id: `sim-3-${Date.now()}`, type: "agent-success", text: `[DESIGNER] Visual mesh calculated. Beautiful high-contrast themes mapped inside index.html.`, timestamp: new Date().toLocaleTimeString(), agent: "Designer" }
      ]);
    }, 1200);

    setTimeout(() => {
      setAgents(prev => prev.map(a => a.id === "debugger" ? { ...a, status: "running", lastAction: "Checking TypeScript warnings..." } : a));
      setTerminalLines(prev => [
        ...prev,
        { id: `sim-4-${Date.now()}`, type: "warning", text: `[DEBUGGER] Source code validated. 0 errors, 1 styling warning successfully patched.`, timestamp: new Date().toLocaleTimeString(), agent: "Debugger" }
      ]);
    }, 1800);

    setTimeout(() => {
      // Default fallback workspace code
      let simulatedHtml = activeProject.files.find(f => f.name === "index.html")?.content || "";
      
      if (isRetroPrompt) {
        simulatedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Retro Glowing Developer Site</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0b0c10] text-[#c5c6c7] font-mono p-8 min-h-screen">
  <div class="max-w-4xl mx-auto border-2 border-[#66fcf1] p-8 rounded-lg shadow-2xl shadow-[#66fcf1]/20">
    <!-- Header -->
    <header class="flex justify-between items-center border-b border-[#202830] pb-6 mb-6">
      <h1 class="text-3xl font-black tracking-widest text-[#66fcf1] uppercase animate-pulse">⚡ RETRO GLOW_</h1>
      <span class="px-2.5 py-1 text-xs bg-[#1f2833] text-[#45f3ff] rounded border border-[#66fcf1]/30">VIOLET MODE</span>
    </header>
    
    <!-- Hero Block -->
    <div class="p-6 bg-[#1f2833]/80 rounded border border-[#66fcf1]/20 mb-8">
      <p class="text-xs text-[#66fcf1]/60 mb-2">// DIRECTIVE RECEIVED FROM AGENT TERMINAL</p>
      <h2 class="text-2xl font-bold text-white mb-4">"${prompt}"</h2>
      <p class="text-sm text-gray-400">
        This retro dark theme has been customized client-side to render beautiful borders, high-contrast neon highlights, and monospace telemetry modules.
      </p>
    </div>

    <!-- Features -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="p-4 bg-black/60 rounded border border-purple-500/30">
        <span class="text-xs text-purple-400 font-bold">[01] VIOLET AMBIENCE</span>
        <p class="text-xs text-gray-400 mt-1">Deep high-contrast indigo shadows render a professional Cyberpunk terminal experience.</p>
      </div>
      <div class="p-4 bg-black/60 rounded border border-[#66fcf1]/30">
        <span class="text-xs text-[#66fcf1] font-bold">[02] INTUITIVE AUTONOMY</span>
        <p class="text-xs text-gray-400 mt-1">The designer mapped and deployed layout shifts dynamically in 18ms compile window.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
      } else if (isSaaSPrompt || isComponent) {
        simulatedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Modern Bento Landing Page</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#080808] text-[#eeeeee] font-sans p-6">
  <div class="max-w-5xl mx-auto">
    <!-- Navbar -->
    <header class="flex justify-between items-center py-4 border-b border-[#1e1e1e] mb-12">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">S</div>
        <span class="text-lg font-bold tracking-tight text-white">SaaS Flow</span>
      </div>
      <span class="text-xs text-[#888888]">Status: Active</span>
    </header>

    <!-- Hero -->
    <div class="text-center py-12 mb-10">
      <h1 class="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
        Beautiful Bento Feature Grid Grid Layout
      </h1>
      <p class="text-[#888888] max-w-xl mx-auto text-sm md:text-base">
        Generated for: "${prompt}" - Designed dynamically with optimized flex layout matrices.
      </p>
    </div>

    <!-- Bento Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-2 p-6 rounded-xl bg-[#0f0f0f] border border-[#1e1e1e] relative overflow-hidden">
        <span class="text-xs text-indigo-400 font-mono font-bold">CORE VALUE</span>
        <h3 class="text-xl font-bold text-white mt-1 mb-2">Simulated Multi-Agent Synapse</h3>
        <p class="text-xs text-[#888888]">All 6 agents mapped requirements locally. Files have been injected smoothly.</p>
      </div>
      <div class="p-6 rounded-xl bg-[#0f0f0f] border border-[#1e1e1e]">
        <span class="text-xs text-green-400 font-mono font-bold">INTEGRATED WORKSPACE</span>
        <h3 class="text-xl font-bold text-white mt-1 mb-2">Instant Reload</h3>
        <p class="text-xs text-[#888888]">Preview browser reflects local cache parameters in real-time.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
      } else {
        simulatedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TerKix Software Output</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#080808] text-[#eeeeee] p-10 font-sans">
  <div class="max-w-2xl mx-auto border border-[#1e1e1e] bg-[#0f0f0f] p-8 rounded-xl shadow-2xl">
    <h1 class="text-2xl font-bold text-white mb-2">Active Sandbox Terminal Live</h1>
    <p class="text-xs text-[#7BA3FF] font-mono mb-6">$ terkix command execute --success</p>
    
    <div class="p-4 bg-black/40 border border-[#1e1e1e] rounded-lg mb-6">
      <p class="text-xs text-gray-400">Directive:</p>
      <p class="text-sm font-semibold text-white">"${prompt}"</p>
    </div>
    <ul class="space-y-2 text-xs text-gray-400">
      <li>&bull; File "workspace/project/index.html" was updated with fresh styling.</li>
      <li>&bull; Workspace file system regenerated with standard assets.</li>
      <li>&bull; Compiled successfully under TerKix development environments.</li>
    </ul>
  </div>
</body>
</html>`;
      }

      // Commit changes to state
      setProjects(prev => prev.map(p => {
        if (p.id === activeProject.id) {
          const files = p.files.map(f => {
            if (f.name === "index.html") {
              return { ...f, content: simulatedHtml };
            }
            return f;
          });
          
          return {
            ...p,
            files,
            commitHistory: [
              {
                hash: Math.random().toString(16).slice(2, 9),
                message: `AI sync: ${prompt.slice(0, 32)}...`,
                author: "Sarah Designer Agent",
                date: new Date().toISOString()
              },
              ...p.commitHistory
            ]
          };
        }
        return p;
      }));

      setTerminalLines(prev => [
        ...prev,
        {
          id: `sim-out-${Date.now()}`,
          type: "agent-success",
          text: `[SYSTEM] Task complete. Simulating successful compile environment logs.\nindex.html generated with beautiful tailwind code styling.`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);

      setAgents(prev => prev.map(a => ({ ...a, status: "idle", lastAction: "Standby." })));
      setIsProcessing(false);
    }, 2400);
  };

  // Create workspace file manually
  const handleCreateFileManually = () => {
    const pathInput = prompt("Enter new file path relative to workspace (e.g. workspace/project/src/Navbar.tsx):");
    if (!pathInput) return;
    const name = pathInput.split("/").pop() || "unnamed";
    
    const newF: WorkspaceFile = {
      path: pathInput,
      name,
      content: `// New file ${name} - TerKix Terminal OS`,
      language: pathInput.endsWith(".html") ? "html" : pathInput.endsWith(".css") ? "css" : "tsx"
    };

    setProjects(prev => prev.map(p => {
      if (p.id === activeProject.id) {
        if (p.files.some(f => f.path === pathInput)) return p;
        return { ...p, files: [...p.files, newF] };
      }
      return p;
    }));

    setSelectedFilePath(pathInput);
  };

  // Save manual edits
  const handleSaveEditedCode = () => {
    setProjects(prev => prev.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          files: p.files.map(f => f.path === selectedFilePath ? { ...f, content: editedCode } : f)
        };
      }
      return p;
    }));
    
    setIsEditingFile(false);
    
    setTerminalLines(prev => [
      ...prev,
      {
        id: `edit-line-${Date.now()}`,
        type: "success",
        text: `[SYSTEM] Content backup and manual edits saved successfully for '${selectedFilePath}'`,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  // Add workspace
  const handleCreateNewWorkspace = (name: string, description: string) => {
    const id = name.toLowerCase().replace(/\s+/g, "-");
    const newProj: Project = {
      id,
      name,
      description,
      createdAt: new Date().toISOString(),
      status: "active",
      activeBranch: "main",
      branches: [{ name: "main", isCurrent: true }],
      commitHistory: [
        {
          hash: Math.random().toString(16).slice(2, 9),
          message: "Boilerplate workspace compiled successfully",
          author: "TerKix Planner Agent",
          date: new Date().toISOString()
        }
      ],
      deployments: [],
      files: [
        {
          path: "workspace/project/index.html",
          name: "index.html",
          language: "html",
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#080808] text-[#eeeeee] p-10 font-sans">
  <div class="max-w-2xl mx-auto border border-[#1e1e1e] bg-[#0f0f0f] p-8 rounded-xl">
    <h1 class="text-3xl font-black text-white mb-2">${name}</h1>
    <p class="text-xs text-[#7BA3FF] font-mono mb-4">Workspace Root: ${id}</p>
    <p class="text-sm text-[#888888]">
      ${description || "A clean sandbox development environment waiting for directives."}
    </p>
  </div>
</body>
</html>`
        }
      ]
    };

    setProjects(prev => [...prev, newProj]);
    setActiveProjectId(id);
    
    setTerminalLines(prev => [
      ...prev,
      {
        id: `work-c-${Date.now()}`,
        type: "success",
        text: `[SYSTEM] Created and mounted active workspace root: '/workspace/${id}'`,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  // Delete workspace
  const handleDeleteWorkspace = (id: string) => {
    const remaining = projects.filter(p => p.id !== id);
    if (remaining.length === 0) return;
    setProjects(remaining);
    setActiveProjectId(remaining[0].id);
  };

  const handleSelectProject = (project: Project) => {
    setActiveProjectId(project.id);
  };

  // Active file HTML output extraction for iframe srcDoc
  const indexHtmlCode = activeProject.files.find(f => f.name === "index.html" || f.path.endsWith("index.html"))?.content || "";

  const navItems = [
    { section: "terminal", Icon: TerminalIcon, label: "Terminal", color: "#3FB950" },
    { section: "dashboard", Icon: Activity, label: "Dashboard", color: "#58A6FF" },
    { section: "files", Icon: Code, label: "Code Editor", color: "#BC8CFF" },
    { section: "agents", Icon: UserCog, label: "AI Agents", color: "#F0883E" },
    { section: "projects", Icon: FolderGit2, label: "Workspaces", color: "#8B949E" },
    { section: "deployments", Icon: Globe, label: "Deployments", color: "#BC8CFF" },
    { section: "contacts", Icon: Users, label: "Contacts", color: "#BC8CFF" },
    { section: "plugins", Icon: Puzzle, label: "Plugins", color: "#3FB950" },
    { section: "chat", Icon: MessageSquare, label: "Team Chat", color: "#58A6FF" },
    { section: "community", Icon: Globe, label: "Community", color: "#4B7FFF" },
    { section: "library", Icon: Package, label: "Thư viện", color: "#4B7FFF" },
    { section: "integrations", Icon: Zap, label: "Integrations", color: "#4B7FFF" },
    { section: "domains", Icon: HardDrive, label: "Domain Tools", color: "#4B7FFF" },
  ];

  return (
    <div
      id="terkix-root"
      ref={terkixRootRef}
      className="w-full h-full overflow-hidden flex relative bg-[#080808] text-[#eeeeee] font-sans"
    >
      {/* CRT scanline overlay */}
      {crtFilter && (
        <div className="pointer-events-none absolute inset-0 z-50 opacity-[0.06] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
      )}

      {/* Mobile backdrop — closes sidebar when tapped outside */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR — always visible on md+, drawer overlay on mobile */}
      <nav className={`
        fixed md:static inset-y-0 left-0 z-40
        w-[220px] md:w-[200px]
        border-r border-[#1e1e1e] bg-[#080808]
        flex flex-col shrink-0 select-none
        transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Logo header */}
        <div className="h-14 border-b border-[#1e1e1e] flex items-center px-4 gap-3 shrink-0">
          <TerKixMark size={28} className="shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-sm leading-tight truncate tracking-tight" style={{ letterSpacing: "-0.02em" }}>TerKix</div>
            <div className="text-[#333333] text-[10px] font-mono tracking-widest uppercase" style={{ letterSpacing: "0.1em" }}>Terminal OS</div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden tk-btn tk-btn-ghost tk-btn-icon"
          >
            <X size={14} />
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-px">
          {navItems.map(({ section, Icon, label }) => {
            const isActive = currentSection === section;
            return (
              <button
                key={section}
                onClick={() => {
                  setCurrentSection(section);
                  setSidebarOpen(false);
                }}
                className={`tk-nav-item ${isActive ? "active" : ""}`}
              >
                <Icon size={13} className="shrink-0" />
                <span>{label}</span>
                {isActive && <span className="ml-auto w-1 h-1 bg-[#4B7FFF] shrink-0 rounded-full" />}
              </button>
            );
          })}
        </div>

        {/* Bottom: project status */}
        <div className="border-t border-[#1e1e1e] px-4 py-3.5 shrink-0 space-y-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full bg-[#4B7FFF] opacity-40"></span>
              <span className="relative inline-flex h-1.5 w-1.5 bg-[#4B7FFF]"></span>
            </span>
            <span className="text-[11px] font-mono text-[#888888] truncate">{activeProject.id}</span>
            <span className="text-[10px] text-[#333333] font-mono ml-auto shrink-0">{activeProject.activeBranch}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#333333] font-mono">
              {computedAgents.filter(a => a.status === "running").length > 0
                ? `${computedAgents.filter(a => a.status === "running").length} running`
                : "All standby"}
            </span>
            {isMicActive && (
              <span className="flex items-center gap-1 text-[10px] text-red-400 font-mono">
                <span className="w-1 h-1 bg-red-500 animate-pulse" />
                REC
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* MAIN AREA — takes full width on mobile, remaining width on desktop */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden w-full">

        {/* TOP HEADER */}
        <header className="h-11 border-b border-[#1e1e1e] bg-[#080808] flex items-center justify-between px-5 shrink-0 select-none gap-2">
          {/* Left */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-[#555555] hover:text-white transition cursor-pointer shrink-0"
            >
              <Menu size={15} />
            </button>
            <TerKixBadge size={22} className="md:hidden shrink-0" />
            <div className="flex items-center gap-2 text-xs font-mono min-w-0">
              <span className="text-[#333333] hidden sm:inline">tty1</span>
              <span className="text-[#222222] hidden sm:inline">/</span>
              <span className="text-[#cccccc] font-medium capitalize truncate" style={{ letterSpacing: "-0.01em" }}>{currentSection}</span>
              {isProcessing && (
                <span className="flex items-center gap-0.5 ml-1 shrink-0">
                  <span className="w-1 h-1 bg-[#4B7FFF] animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1 h-1 bg-[#4B7FFF] animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1 h-1 bg-[#4B7FFF] animate-bounce"></span>
                </span>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline text-[11px] font-mono text-[#4B7FFF] font-medium">
              {activeProject.status === "active" ? "LIVE" : activeProject.status}
            </span>
            <button
              type="button"
              onClick={toggleMicrophone}
              className={`transition cursor-pointer ${
                isMicActive ? "text-red-400" : "text-[#555555] hover:text-white"
              }`}
              title="Toggle microphone"
            >
              {isMicActive ? <MicOff size={13} /> : <Mic size={13} />}
            </button>
            <button
              type="button"
              onClick={() => setCrtFilter(p => !p)}
              className={`hidden sm:flex transition cursor-pointer ${
                crtFilter ? "text-[#7BA3FF]" : "text-[#555555] hover:text-white"
              }`}
              title="Toggle CRT scanline"
            >
              <Cpu size={13} />
            </button>
            <span className="text-xs font-mono text-[#444444] hidden md:inline tabular-nums">
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </header>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-hidden flex flex-col">

          {/* TERMINAL — always rendered, hidden when not active */}
          <div className={`flex-1 flex flex-col min-h-0 ${currentSection === "terminal" ? "flex" : "hidden"}`}>
            <div className="flex-1 bg-[#080808] flex flex-col overflow-hidden">

              {/* ── Terminal toolbar ── */}
              <div className="flex items-center border-b border-[#1e1e1e] bg-[#080808] shrink-0 h-10 px-5">
                <div className="flex items-center gap-3">
                  <span className={`w-1.5 h-1.5 ${isProcessing ? "bg-[#4B7FFF] animate-pulse" : "bg-[#333333]"}`} />
                  <span className="text-xs font-mono font-medium text-[#888888]">console</span>
                  <span className="text-xs font-mono text-[#444444]">{terminalLines.length}</span>
                </div>

                <div className="flex-1" />

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {(["sm","base","lg"] as const).map(sz => (
                      <button
                        key={sz}
                        onClick={() => setConsoleFontSize(sz)}
                        className={`px-2 py-1 text-[10px] font-mono transition cursor-pointer ${
                          consoleFontSize === sz
                            ? "text-white"
                            : "text-[#444444] hover:text-[#888888]"
                        }`}
                      >
                        {sz === "sm" ? "S" : sz === "base" ? "M" : "L"}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      const text = terminalLines.map(l => l.text).join("\n");
                      navigator.clipboard?.writeText(text).catch(() => {});
                    }}
                    className="text-[#444444] hover:text-[#888888] transition cursor-pointer flex items-center gap-1.5 text-[10px] font-mono"
                    title="Copy all"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                    <span className="hidden sm:inline">Copy</span>
                  </button>

                  <button
                    onClick={() => setTerminalLines([])}
                    className="text-[#444444] hover:text-[#888888] transition cursor-pointer flex items-center gap-1.5 text-[10px] font-mono"
                    title="Clear"
                  >
                    <Trash2 size={11} />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                </div>
              </div>

              {/* Terminal output viewport */}
              <div
                onScroll={(e) => {
                  const target = e.currentTarget;
                  const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 80;
                  if (isProcessing && !isAtBottom) {
                    terminalScrollRef.current = false;
                  } else if (isAtBottom) {
                    terminalScrollRef.current = true;
                  }
                }}
                className={`flex-1 px-6 py-5 font-mono overflow-y-auto space-y-2.5 select-text ${
                  consoleFontSize === "sm" ? "text-xs" : consoleFontSize === "lg" ? "text-sm" : "text-[13px]"
                }`}
              >
                {/* Thinking mode trace */}
                {detailedReasoningText && (
                  <div className="mb-5 p-5 bg-[#0f0f0f] border border-[#1e1e1e] text-[#888888] text-xs leading-relaxed animate-fade-in font-sans">
                    <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-3 mb-3">
                      <span className="flex items-center gap-2 font-mono text-[11px] text-[#7BA3FF] font-medium">
                        <Cpu size={11} className="animate-pulse" />
                        Thinking Mode
                      </span>
                      <button
                        type="button"
                        onClick={() => setDetailedReasoningText("")}
                        className="text-[10px] text-[#555555] hover:text-white transition cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                    <p className="whitespace-pre-line text-[#888888] font-mono text-xs">{detailedReasoningText}</p>
                  </div>
                )}

                {/* Terminal lines */}
                {terminalLines.map((line) => {
                  if (line.type === "input") {
                    return (
                      <div key={line.id} className="flex gap-3 items-start animate-fade-in py-0.5">
                        <span className="font-mono font-semibold shrink-0 select-none text-[#4B7FFF]">~$</span>
                        <span className="text-[#eeeeee] font-mono break-all whitespace-pre-wrap leading-relaxed">{line.text}</span>
                      </div>
                    );
                  }
                  if (line.type === "agent-info") return (
                    <div key={line.id} className="border-l border-[#4B7FFF]/40 pl-4 py-1.5 animate-fade-in">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[#7BA3FF] font-mono font-medium text-[10px] uppercase tracking-wide">{line.agent}</span>
                        <span className="text-[#333333] text-[10px] font-mono">·</span>
                        <span className="text-[#333333] font-mono text-[10px]">log</span>
                      </div>
                      <div className="text-[#888888] font-mono leading-relaxed whitespace-pre-line">{line.text}</div>
                    </div>
                  );
                  if (line.type === "agent-success") return (
                    <div key={line.id} className="border-l border-[#4B7FFF]/60 pl-4 py-1.5 animate-fade-in">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[#7BA3FF] font-mono font-medium text-[10px] uppercase tracking-wide">{line.agent || "AGENT"}</span>
                        <span className="text-[#333333] text-[10px] font-mono">·</span>
                        <span className="text-[#4B7FFF] font-mono text-[10px]">success</span>
                      </div>
                      <div className="text-[#cccccc] font-mono leading-relaxed whitespace-pre-line">{line.text}</div>
                    </div>
                  );
                  if (line.type === "success") return (
                    <div key={line.id} className="border-l border-[#4B7FFF]/40 pl-4 py-1 animate-fade-in">
                      <div className="text-[#cccccc] font-mono leading-relaxed whitespace-pre-line">{line.text}</div>
                    </div>
                  );
                  if (line.type === "warning") return (
                    <div key={line.id} className="border-l border-yellow-600/40 pl-4 py-1.5 flex gap-2.5 animate-fade-in">
                      <AlertTriangle size={12} className="text-yellow-600 shrink-0 mt-0.5" />
                      <span className="text-[#888888] font-mono leading-relaxed">{line.text}</span>
                    </div>
                  );
                  if (line.type === "danger") return (
                    <div key={line.id} className="border-l border-red-700/40 pl-4 py-1.5 animate-fade-in">
                      <div className="text-[#888888] font-mono leading-relaxed whitespace-pre-line">{line.text}</div>
                    </div>
                  );
                  return (
                    <div key={line.id} className="text-[#555555] font-mono leading-relaxed whitespace-pre-wrap">{line.text}</div>
                  );
                })}

                {/* AI running indicator */}
                {isProcessing && (
                  <div className="flex items-center gap-2.5 py-1 animate-fade-in">
                    <div className="flex gap-1">
                      <span className="w-1 h-1 bg-[#4B7FFF] animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1 h-1 bg-[#4B7FFF] animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1 h-1 bg-[#4B7FFF] animate-bounce" />
                    </div>
                    <span className="text-[#444444] text-xs font-mono">agents running…</span>
                  </div>
                )}
                <div ref={terminalEndRef} />
              </div>

              {/* ── Keyboard shortcuts bar ── */}
              <div className="flex items-center gap-1.5 border-t border-[#1e1e1e] bg-[#080808] px-5 py-2 select-none overflow-x-auto shrink-0">
                <div className="flex gap-1 flex-1">
                  {["ESC", "TAB", "CTRL", "ALT", "–", "+", "CLEAR"].map(k => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => handleTermKeyAction(k)}
                      className="tk-btn tk-btn-outline font-mono shrink-0"
                      style={{ fontSize: 10, padding: "4px 9px", letterSpacing: "0.04em" }}
                    >
                      {k}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1 shrink-0">
                  {["↑", "↓"].map(k => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => handleTermKeyAction(k === "↑" ? "PGUP" : "PGDN")}
                      className="tk-btn tk-btn-outline font-mono w-7 h-7"
                      style={{ fontSize: 12, padding: 0 }}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Command Input ── */}
              <div className="shrink-0 border-t border-[#1e1e1e] bg-[#080808] px-4 pt-3 pb-3">
                {/* Input container — elevated card like ChatGPT/Claude */}
                <form
                  onSubmit={handleCommandSubmit}
                  className={`relative flex items-center bg-[#111111] border transition-colors duration-150 ${
                    isProcessing
                      ? "border-[#4B7FFF]/30"
                      : "border-[#222222] focus-within:border-[#333333]"
                  }`}
                >
                  {/* Prompt prefix */}
                  <div
                    className={`shrink-0 pl-4 pr-2 font-mono font-semibold select-none transition-all duration-200 ${
                      isProcessing ? "text-[#4B7FFF] animate-pulse" : "text-[#4B7FFF]"
                    }`}
                    style={{ fontSize: 13 }}
                  >
                    {isProcessing ? "⟳" : "~$"}
                  </div>

                  {/* Text input */}
                  <input
                    type="text"
                    value={commandText}
                    onChange={(e) => setCommandText(e.target.value)}
                    disabled={isProcessing}
                    placeholder={isProcessing ? "Agent running…" : "Ask anything or run a command…"}
                    className="flex-1 bg-transparent border-none outline-none font-mono text-[13px] text-[#eeeeee] placeholder-[#333333] focus:ring-0 select-text min-w-0 py-3.5 pr-2"
                    style={{ fontFeatureSettings: '"kern" 0, "liga" 1', letterSpacing: "0.005em" }}
                    autoFocus
                  />

                  {/* Think toggle — small icon pill */}
                  <button
                    type="button"
                    onClick={() => {
                      setThinkingMode(!thinkingMode);
                      if (!thinkingMode) setDetailedReasoningText("Thinking Mode activated. Agent stacks will decompose requirements in detail.");
                      else setDetailedReasoningText("");
                    }}
                    className={`shrink-0 flex items-center gap-1 mr-2 px-2.5 py-1 font-mono text-[10px] transition-all duration-150 cursor-pointer rounded-full ${
                      thinkingMode
                        ? "bg-[#4B7FFF]/15 text-[#7BA3FF] border border-[#4B7FFF]/30"
                        : "text-[#444444] hover:text-[#666666] border border-transparent hover:border-[#222222]"
                    }`}
                    title="Toggle thinking mode"
                  >
                    <Cpu size={10} />
                    <span className="hidden sm:inline">{thinkingMode ? "Think" : "Think"}</span>
                  </button>

                  {/* Send button — circular, ChatGPT/Claude style */}
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className={`shrink-0 mr-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer pointer-events-auto ${
                      isProcessing
                        ? "bg-[#4B7FFF]/20 text-[#4B7FFF] cursor-not-allowed"
                        : commandText.trim().length > 0
                          ? "bg-white hover:bg-[#e8e8e8] active:scale-95 active:bg-[#d0d0d0] text-[#080808] shadow-sm"
                          : "bg-[#1e1e1e] text-[#444444] cursor-not-allowed"
                    }`}
                    title="Send (Enter)"
                  >
                    {isProcessing ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="animate-spin">
                        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="22" strokeDashoffset="8" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 11V3M3.5 6.5L7 3L10.5 6.5" stroke="currentColor" strokeWidth="1.8" />
                      </svg>
                    )}
                  </button>
                </form>

                {/* Bottom hint row */}
                <div className="flex items-center justify-between mt-1.5 px-1">
                  <span className="text-[10px] font-mono text-[#222222]">Enter ↵ to send · ESC to clear</span>
                  {commandText.length > 0 && !isProcessing && (
                    <span className="text-[10px] font-mono text-[#333333] tabular-nums">{commandText.length} chars</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ALL OTHER SECTIONS */}
          {currentSection !== "terminal" && (
            <div className="flex-1 overflow-y-auto">

              {/* DASHBOARD */}
              {currentSection === "dashboard" && (
                <DashboardOverview
                  project={activeProject}
                  agents={agents}
                  setCurrentSection={setCurrentSection}
                  onRunPresetCommand={(cmd) => {
                    setCurrentSection("terminal");
                    setCommandText(cmd);
                    setTimeout(() => handleCommandSubmit(), 200);
                  }}
                  totalCommandsRun={totalCommandsRun}
                />
              )}

              {/* FILES / CODE EDITOR */}
              {currentSection === "files" && (
                <div className="flex flex-col h-full relative" id="visual-editor-workbench">

                  {/* ── Top bar: file name + actions ── */}
                  <div className="h-10 border-b border-[#1e1e1e] bg-[#080808] flex items-center gap-0 shrink-0">
                    {/* Mobile: hamburger to toggle file tree */}
                    <button
                      onClick={() => setMobileFileTreeOpen(p => !p)}
                      className="md:hidden h-full px-3 border-r border-[#1e1e1e] text-[#666666] hover:text-white transition cursor-pointer flex items-center gap-1.5 shrink-0"
                      title="Toggle file list"
                    >
                      <HardDrive size={12} />
                      <ChevronRight size={10} className={`transition-transform ${mobileFileTreeOpen ? "rotate-90" : ""}`} />
                    </button>

                    {/* File name */}
                    <span className="flex-1 px-3 text-[11px] font-mono text-[#7BA3FF] flex items-center gap-1.5 truncate min-w-0">
                      <FileCode2 size={11} className="shrink-0" />
                      <span className="truncate">{selectedFilePath ? selectedFilePath.replace("workspace/project/", "") : "— select a file —"}</span>
                    </span>

                    {/* Actions */}
                    <button
                      onClick={handleCreateFileManually}
                      className="h-full px-3 border-l border-[#1e1e1e] text-[#666666] hover:text-white transition cursor-pointer flex items-center shrink-0"
                      title="New file"
                    >
                      <Plus size={13} />
                    </button>
                    <button
                      onClick={handleSaveEditedCode}
                      className="h-full px-4 border-l border-[#1e1e1e] bg-[#4B7FFF] hover:bg-[#6B9FFF] text-white text-[10px] font-bold font-mono uppercase tracking-wide flex items-center gap-1.5 transition cursor-pointer shrink-0"
                    >
                      <Save size={10} /> Lưu
                    </button>
                  </div>

                  {/* ── Body: file tree + editor + preview ── */}
                  <div className="flex-1 flex min-h-0 overflow-hidden">

                    {/* File tree — always visible on md+, drawer on mobile */}
                    <div className={`
                      flex-col border-r border-[#1e1e1e] bg-[#0f0f0f] shrink-0
                      ${mobileFileTreeOpen ? "flex absolute inset-y-0 left-0 z-20 w-56" : "hidden"}
                      md:flex md:static md:w-48 md:z-auto
                    `}>
                      {/* Mobile backdrop */}
                      {mobileFileTreeOpen && (
                        <div
                          className="md:hidden fixed inset-0 bg-black/50 z-10"
                          onClick={() => setMobileFileTreeOpen(false)}
                          style={{ position: "fixed" }}
                        />
                      )}
                      <div className="relative z-20 flex flex-col h-full bg-[#0f0f0f]">
                        <div className="px-3 py-2 border-b border-[#1e1e1e]">
                          <span className="text-[9px] font-mono font-bold text-[#555555] uppercase tracking-widest">TỆP — {activeProject.files.length}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto py-1">
                          {activeProject.files.map((file, i) => {
                            const isSelected = selectedFilePath === file.path;
                            const shortName = file.path.replace("workspace/project/", "");
                            return (
                              <div
                                key={i}
                                className={`group flex items-center justify-between border-l-2 transition cursor-pointer ${
                                  isSelected
                                    ? "border-l-[#4B7FFF] bg-[#141414] text-[#7BA3FF]"
                                    : "border-l-transparent text-[#666666] hover:bg-[#141414]/60 hover:text-[#cccccc]"
                                }`}
                              >
                                <button
                                  onClick={() => {
                                    setSelectedFilePath(file.path);
                                    setMobileFileTreeOpen(false);
                                  }}
                                  className="flex-1 text-left flex items-center gap-2 px-3 py-2 min-w-0"
                                >
                                  <FileCode2 size={11} className="shrink-0 opacity-60" />
                                  <span className="text-[11px] font-mono truncate">{shortName}</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(`Xoá ${shortName}?`)) {
                                      setProjects(prev => prev.map(p =>
                                        p.id === activeProject.id
                                          ? { ...p, files: p.files.filter(f => f.path !== file.path) }
                                          : p
                                      ));
                                    }
                                  }}
                                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition px-2 cursor-pointer shrink-0"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                        <div className="px-3 py-2 border-t border-[#1e1e1e] shrink-0">
                          <div className="border border-yellow-600/20 bg-yellow-600/5 text-[9px] text-[#D29922] px-2 py-1.5 leading-relaxed">
                            <span className="font-bold flex items-center gap-1"><AlertTriangle size={8} /> AI tự sửa tệp</span>
                            Gõ lệnh ở Terminal để tạo code.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── Code editor ── */}
                    <div className="flex-1 flex min-w-0 bg-[#080808] overflow-hidden">
                      {/* Line numbers — hidden on mobile */}
                      <div className="hidden sm:flex flex-col w-10 bg-[#080808] border-r border-[#1e1e1e]/30 text-right text-[10px] font-mono text-[#1e3355] select-none shrink-0 overflow-hidden pt-4 pr-2 leading-[1.6]">
                        {Array.from({ length: Math.max(editedCode.split("\n").length + 5, 30) }).map((_, i) => (
                          <div key={i}>{i + 1}</div>
                        ))}
                      </div>

                      {/* Textarea — NO word wrap, horizontal scroll */}
                      <textarea
                        value={editedCode}
                        onChange={(e) => setEditedCode(e.target.value)}
                        className="flex-1 bg-transparent text-[#cccccc] font-mono p-4 leading-[1.6] resize-none focus:outline-none select-text pointer-events-auto"
                        style={{
                          fontSize: "12px",
                          whiteSpace: "pre",
                          overflowWrap: "normal",
                          overflowX: "auto",
                          overflowY: "auto",
                          tabSize: 2,
                        }}
                        spellCheck={false}
                        autoCorrect="off"
                        autoCapitalize="off"
                      />
                    </div>

                    {/* ── Live Preview — hidden on mobile ── */}
                    <div className="hidden md:flex w-[38%] border-l border-[#1e1e1e] flex-col shrink-0">
                      <div className="h-8 bg-[#080808] border-b border-[#1e1e1e] flex items-center px-3 text-[9px] font-mono text-[#555555] uppercase tracking-wider shrink-0">
                        <Globe size={9} className="mr-1.5 text-[#3FB950]" /> Xem trước
                      </div>
                      <div className="flex-1 bg-white relative">
                        {indexHtmlCode ? (
                          <iframe
                            srcDoc={indexHtmlCode}
                            title="Preview"
                            sandbox="allow-scripts"
                            className="w-full h-full border-none"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-[#888888] bg-[#080808]">
                            Không có HTML
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI AGENTS */}
              {currentSection === "agents" && (
                <div className="px-8 py-10 max-w-5xl mx-auto space-y-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-white tracking-tight">Agents</h2>
                      <p className="text-sm text-[#888888] mt-1">Autonomous roles in the multi-agent pipeline.</p>
                    </div>
                    <span className="text-xs font-mono text-[#555555]">
                      {computedAgents.length} registered
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1e1e1e]">
                    {computedAgents.map((ag) => {
                      const isRunning = ag.status === "running";
                      return (
                        <div
                          key={ag.id}
                          className={`p-6 bg-[#080808] transition-colors ${isRunning ? "bg-[#0f0f0f]" : "hover:bg-[#0a0a0a]"}`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <span className={`w-1.5 h-1.5 shrink-0 ${isRunning ? "bg-[#4B7FFF] animate-pulse" : "bg-[#333333]"}`} />
                              <h3 className="font-semibold text-white text-sm">{ag.role}</h3>
                            </div>
                            <span className={`text-[10px] font-mono ${isRunning ? "text-[#7BA3FF]" : "text-[#444444]"}`}>
                              {isRunning ? "ACTIVE" : "IDLE"}
                            </span>
                          </div>
                          <p className="text-xs text-[#555555] mb-5 leading-relaxed">{ag.description}</p>
                          <div className="border-t border-[#1e1e1e] pt-4 text-xs font-mono text-[#444444]">
                            {ag.lastAction}
                          </div>
                          {isRunning && (
                            <div className="h-px bg-[#1e1e1e] overflow-hidden mt-4">
                              <div className="h-full bg-[#4B7FFF] animate-pulse" style={{ width: "60%" }} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* WORKSPACES / PROJECTS */}
              {currentSection === "projects" && (
                <div className="p-6">
                  <ProjectList
                    projects={projects}
                    activeProject={activeProject}
                    onSelectProject={handleSelectProject}
                    onCreateProject={handleCreateNewWorkspace}
                    onDeleteProject={handleDeleteWorkspace}
                  />
                </div>
              )}

              {/* DEPLOYMENTS */}
              {currentSection === "deployments" && (
                <div className="px-8 py-10 max-w-4xl mx-auto space-y-8">
                  <div>
                    <h2 className="text-2xl font-semibold text-white tracking-tight">Deployments</h2>
                    <p className="text-sm text-[#888888] mt-1">Hosting builds, active routes, and production URLs.</p>
                  </div>
                  {activeProject.deployments.length === 0 ? (
                    <div className="py-24 text-center border border-[#1e1e1e] flex flex-col items-center gap-4">
                      <Globe size={28} className="text-[#333333]" />
                      <div>
                        <p className="text-sm font-medium text-[#eeeeee]">No deployments yet</p>
                        <p className="text-xs text-[#555555] mt-1">
                          Run <code className="font-mono text-[#7BA3FF]">deploy</code> in the terminal to publish.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-[#1e1e1e] divide-y divide-[#1e1e1e]">
                      {activeProject.deployments.map((dep, i) => (
                        <div
                          key={i}
                          className="px-6 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-[#0f0f0f] transition-colors"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-mono text-[#555555] uppercase">{dep.provider}</span>
                              <span className="text-sm font-mono text-[#eeeeee]">{dep.url}</span>
                            </div>
                            <p className="text-xs text-[#555555] font-mono">
                              {dep.branch} · {dep.commitHash}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <span className="text-xs font-mono text-[#4B7FFF]">LIVE</span>
                            <a
                              href={dep.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs text-[#555555] hover:text-[#eeeeee] transition-colors"
                            >
                              <ExternalLink size={12} /> Visit
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* CONTACTS */}
              {currentSection === "contacts" && (
                <div className="p-6">
                  <ContactsManager
                    activeCollaborators={activeCollaborators}
                    onAddCollaborator={handleAddCollaborator}
                    activeProjectName={activeProject.name}
                  />
                </div>
              )}

              {/* PLUGINS */}
              {currentSection === "plugins" && (
                <div className="p-6">
                  <PluginManager
                    plugins={customPlugins}
                    onAddPlugin={handleAddPlugin}
                    onDeletePlugin={handleDeletePlugin}
                    onTogglePlugin={handleTogglePlugin}
                  />
                </div>
              )}

              {/* TEAM CHAT */}
              {currentSection === "chat" && (
                <div className="flex flex-col bg-[#070a0f] min-h-[calc(100vh-88px)]">
                  {/* Chat header */}
                  <div className="py-3 px-4 border-b border-[#1e1e1e] flex items-center justify-between bg-[#0d121c] shrink-0">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="text-blue-400" size={15} />
                      <span className="text-sm font-semibold text-white">Team Chat</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {activeCollaborators.map((col, i) => (
                        <span key={i} className="text-[10px] font-mono bg-[#0f0f0f] border border-[#1e1e1e] px-2 py-0.5 rounded text-[#7BA3FF] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                          {col.name.split(" ")[0]}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {chatMessages.map(msg => {
                      const isYou = msg.sender.includes("You");
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-3 ${msg.isAgent ? "bg-indigo-950/15 p-3 rounded-xl border border-indigo-500/15" : ""}`}
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black uppercase text-[10px] shrink-0 ${
                            isYou
                              ? "bg-[#3FB950]/20 text-[#3FB950] border border-[#3FB950]/35"
                              : "bg-slate-800 text-[#7BA3FF] border border-slate-700"
                          }`}>
                            {msg.sender.substring(0, 2)}
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-bold text-[11px] font-mono ${isYou ? "text-[#3FB950]" : "text-zinc-200"}`}>{msg.sender}</span>
                              {msg.role && (
                                <span className="text-[9px] bg-[#0f0f0f] text-[#888888] border border-slate-700/50 px-1.5 py-0.5 rounded uppercase font-mono">{msg.role}</span>
                              )}
                              <span className="text-[9px] text-[#888888]">{msg.timestamp}</span>
                            </div>
                            <p className="text-[#b1bccc] text-[12px] leading-relaxed">{msg.text}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat input */}
                  <div className="p-3 border-t border-[#1e1e1e] bg-[#0d121c] shrink-0">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSendChatMessage();
                          }
                        }}
                        placeholder="Type a message... (Enter to send)"
                        className="bg-[#090d13] border border-[#1e1e1e] rounded-lg px-3 py-2 text-[12px] text-white placeholder-gray-500 flex-1 focus:outline-none focus:border-[#58A6FF] font-sans pointer-events-auto"
                      />
                      <button
                        type="button"
                        onClick={handleSendChatMessage}
                        className="bg-[#3FB950] hover:bg-green-600 text-[#0D1117] px-4 font-bold rounded-lg text-[12px] transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Send size={12} /> Send
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* COMMUNITY */}
              {currentSection === "community" && (
                <div className="flex-1 overflow-hidden flex flex-col">
                  <CommunityPage />
                </div>
              )}

              {/* LIBRARY */}
              {currentSection === "library" && (
                <div className="flex-1 overflow-hidden flex flex-col">
                  <LibraryRegistry />
                </div>
              )}

              {/* INTEGRATIONS */}
              {currentSection === "integrations" && (
                <div className="flex-1 overflow-hidden flex flex-col">
                  <IntegrationsPage />
                </div>
              )}

              {/* DOMAIN TOOLS */}
              {currentSection === "domains" && (
                <div className="flex-1 overflow-hidden flex flex-col">
                  <DomainToolsPage />
                </div>
              )}

            </div>
          )}

        </main>
      </div>
      <Analytics />
    </div>
  );
}
