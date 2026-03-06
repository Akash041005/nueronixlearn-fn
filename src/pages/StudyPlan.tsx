import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Grid,
  LinearProgress,
  Chip,
  CardMedia,
  CardActionArea,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  IconButton,
  Autocomplete,
  Alert,
  Tooltip,
} from "@mui/material";

import {
  CheckCircle,
  RadioButtonUnchecked,
  PlayCircle,
  Article,
  Add,
  Close,
  School,
  ErrorOutline,
  Delete,
  TaskAlt,
  ChevronRight,
  VideoLibrary,
  MenuBook,
  Bolt,
  ArrowForwardIos,
  InfoOutlined,
} from "@mui/icons-material";

import { motion, AnimatePresence } from "framer-motion";
import { topicsAPI } from "../services/api";
import PageBackground from "../components/PageBackground";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Subject {
  _id: string;
  subject: string;
}

interface Topic {
  _id: string;
  topicTitle: string;
  order: number;
  completed: boolean;
}

interface Subtopic {
  _id: string;
  topicTitle: string;
  subtopicTitle: string;
  order: number;
  completed: boolean;
}

interface VideoResource {
  title: string;
  url: string;
  thumbnail?: string;
  channelName?: string;
}

interface BlogResource {
  title: string;
  url: string;
  source: string;
  description?: string;
}

interface Resources {
  videos: VideoResource[];
  blogs: BlogResource[];
  aiUnavailable?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const POPULAR_SUBJECTS = [
  "JavaScript", "Python", "Machine Learning", "Data Structures",
  "React", "Node.js", "Cyber Security", "Database Management",
  "DevOps", "Mobile Development",
];

const fade = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function StudyPlan() {
  const [pageLoading,   setPageLoading]   = useState(true);
  const [subjects,      setSubjects]      = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const [topics,        setTopics]        = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const [subtopics,        setSubtopics]        = useState<Subtopic[]>([]);
  const [selectedSubtopic, setSelectedSubtopic] = useState<Subtopic | null>(null);
  const [subtopicsLoading, setSubtopicsLoading] = useState(false);
  const [subtopicsError,   setSubtopicsError]   = useState(false);
  // true when no subtopics exist and we fell back to topic-level resources
  const [topicFallback,    setTopicFallback]    = useState(false);

  const [resources,        setResources]        = useState<Resources>({ videos: [], blogs: [] });
  const [resourcesLoading, setResourcesLoading] = useState(false);

  const [roadmapGenerating, setRoadmapGenerating] = useState(false);

  // Dialog state
  const [dialogOpen,    setDialogOpen]    = useState(false);
  const [newSubject,    setNewSubject]    = useState("");
  const [popularPick,   setPopularPick]   = useState<string | null>(null);
  const [addingSubject, setAddingSubject] = useState(false);
  const [addError,      setAddError]      = useState("");

  // Completion state
  const [completingTopic,    setCompletingTopic]    = useState(false);
  const [completingSubtopic, setCompletingSubtopic] = useState(false);
  const [deletingId,         setDeletingId]         = useState<string | null>(null);

  // Track the "active fetch" so a stale async can be cancelled
  const subtopicFetchRef = useRef<number>(0);

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const fetchSubjects = useCallback(async (): Promise<Subject[]> => {
    try {
      const res = await topicsAPI.getSubjects();
      const data: Subject[] = res.data.subjects || [];
      setSubjects(data);
      return data;
    } catch {
      return [];
    }
  }, []);

  // ─── Init ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      const data = await fetchSubjects();
      if (data.length > 0) setSelectedSubject(data[0]);
      setPageLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Resource fetch — explicit args, zero stale closures ──────────────────

  const fetchResources = useCallback(
    async (subject: Subject, topic: Topic, subtopic: Subtopic) => {
      setResourcesLoading(true);
      try {
        const res = await topicsAPI.getSubtopicResources(
          subject.subject,
          topic.topicTitle,
          subtopic.subtopicTitle,
        );
        const d: Resources = res.data;
        setResources({
          videos: d.videos || [],
          blogs:  d.blogs  || [],
          aiUnavailable: d.aiUnavailable || false,
        });
      } catch {
        setResources({ videos: [], blogs: [] });
      } finally {
        setResourcesLoading(false);
      }
    },
    [],
  );

  // ─── Topic-level resource fetch (fallback when no subtopics exist) ──────────

  const fetchTopicResources = useCallback(
    async (subject: Subject, topic: Topic) => {
      setResourcesLoading(true);
      try {
        const res = await topicsAPI.getResources(subject.subject, topic.topicTitle);
        const d: Resources = res.data;
        setResources({
          videos: d.videos || [],
          blogs:  d.blogs  || [],
          aiUnavailable: d.aiUnavailable || false,
        });
      } catch {
        setResources({ videos: [], blogs: [] });
      } finally {
        setResourcesLoading(false);
      }
    },
    [],
  );

  // ─── Core: given a topic + current subtopics snapshot, load & select first ─

  const loadTopicSubtopics = useCallback(
    async (topic: Topic, subject: Subject, currentSubtopics: Subtopic[]) => {
      const topicTitle = topic.topicTitle;
      const token = ++subtopicFetchRef.current; // cancel stale fetches

      setSubtopicsLoading(true);
      setSubtopicsError(false);
      setTopicFallback(false);
      setSelectedSubtopic(null);
      setResources({ videos: [], blogs: [] });

      try {
        let matched = currentSubtopics.filter(
          (s) => s.topicTitle?.toLowerCase().trim() === topicTitle.toLowerCase().trim()
        );

        if (matched.length === 0) {
          const res  = await topicsAPI.getSubtopics(subject.subject, topicTitle);
          if (token !== subtopicFetchRef.current) return; // stale, abort

          const raw: any[] = res.data.subtopics || [];
          if (raw.length > 0) {
            matched = raw.map((s: any, i: number) => ({
              _id:           s._id || `sub-${topicTitle}-${i}`,
              topicTitle,
              subtopicTitle: s.title || s.subtopicTitle || s.name || "",
              order:         s.order ?? i + 1,
              completed:     s.completed || false,
            }));

            setSubtopics((prev) => {
              const existing = new Set(
                prev
                  .filter((s) => s.topicTitle?.toLowerCase().trim() === topicTitle.toLowerCase().trim())
                  .map((s) => s.subtopicTitle)
              );
              const fresh = matched.filter((s) => !existing.has(s.subtopicTitle));
              return fresh.length > 0 ? [...prev, ...fresh] : prev;
            });
          }
        }

        if (token !== subtopicFetchRef.current) return; // stale, abort

        if (matched.length > 0) {
          const first = [...matched].sort((a, b) => a.order - b.order)[0];
          setSelectedSubtopic(first);
          setSubtopicsLoading(false);
          await fetchResources(subject, topic, first);
        } else {
          // No subtopics found — fall back to topic-level resources automatically
          setTopicFallback(true);
          setSubtopicsLoading(false);
          await fetchTopicResources(subject, topic);
        }
      } catch {
        if (token !== subtopicFetchRef.current) return;
        // On API error also fall back gracefully to topic-level resources
        setTopicFallback(true);
        setSubtopicsLoading(false);
        await fetchTopicResources(subject, topic);
      }
    },
    [fetchResources, fetchTopicResources],
  );

  // ─── Roadmap load when subject changes ─────────────────────────────────────

  useEffect(() => {
    if (!selectedSubject) return;

    (async () => {
      setRoadmapGenerating(true);
      setTopics([]);
      setSubtopics([]);
      setSelectedTopic(null);
      setSelectedSubtopic(null);
      setResources({ videos: [], blogs: [] });
      setSubtopicsError(false);
      setTopicFallback(false);

      try {
        const res = await topicsAPI.getRoadmap(selectedSubject.subject);
        const topicsData:   Topic[]   = res.data.topics    || [];
        const subtopicsData: Subtopic[] = res.data.subtopics || [];

        setTopics(topicsData);
        setSubtopics(subtopicsData);

        if (topicsData.length > 0) {
          const first = [...topicsData].sort((a, b) => a.order - b.order)[0];
          setSelectedTopic(first);
          await loadTopicSubtopics(first, selectedSubject, subtopicsData);
        }
      } catch {
        // silent
      } finally {
        setRoadmapGenerating(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleSelectTopic = useCallback(
    async (topic: Topic) => {
      if (!selectedSubject) return;
      setSelectedTopic(topic);
      await loadTopicSubtopics(topic, selectedSubject, subtopics);
    },
    [selectedSubject, subtopics, loadTopicSubtopics],
  );

  const handleSelectSubtopic = useCallback(
    async (subtopic: Subtopic) => {
      if (!selectedSubject || !selectedTopic) return;
      setTopicFallback(false);
      setSelectedSubtopic(subtopic);
      await fetchResources(selectedSubject, selectedTopic, subtopic);
    },
    [selectedSubject, selectedTopic, fetchResources],
  );

  const handleCompleteSubtopic = async () => {
    if (!selectedSubject || !selectedTopic || !selectedSubtopic) return;
    setCompletingSubtopic(true);
    try {
      await topicsAPI.completeSubtopic(
        selectedSubject.subject,
        selectedTopic.topicTitle,
        selectedSubtopic.subtopicTitle,
      );
      setSubtopics((prev) =>
        prev.map((s) =>
          s.subtopicTitle === selectedSubtopic.subtopicTitle ? { ...s, completed: true } : s
        )
      );
      setSelectedSubtopic((p) => (p ? { ...p, completed: true } : p));
    } catch { /* silent */ } finally {
      setCompletingSubtopic(false);
    }
  };

  const handleCompleteTopic = async () => {
    if (!selectedSubject || !selectedTopic) return;
    setCompletingTopic(true);
    try {
      await topicsAPI.completeTopic(selectedSubject.subject, selectedTopic.topicTitle);
      setTopics((prev) =>
        prev.map((t) =>
          t.topicTitle === selectedTopic.topicTitle ? { ...t, completed: true } : t
        )
      );
      setSelectedTopic((p) => (p ? { ...p, completed: true } : p));
    } catch { /* silent */ } finally {
      setCompletingTopic(false);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    setDeletingId(id);
    try {
      await topicsAPI.deleteSubject(id);
      const updated = await fetchSubjects();
      if (selectedSubject?._id === id) {
        const next = updated[0] || null;
        setSelectedSubject(next);
        if (!next) {
          setTopics([]); setSubtopics([]);
          setSelectedTopic(null); setSelectedSubtopic(null);
          setResources({ videos: [], blogs: [] });
        }
      }
    } catch { /* silent */ } finally {
      setDeletingId(null);
    }
  };

  const handleAddSubject = async () => {
    const name = (newSubject.trim() || popularPick?.trim() || "").trim();
    if (!name) { setAddError("Please enter or select a subject"); return; }

    setAddingSubject(true);
    setAddError("");
    try {
      const res      = await topicsAPI.addSubject(name);
      const updated  = await fetchSubjects();
      const newDoc   =
        updated.find((s) => s.subject === name.toLowerCase()) ||
        updated.find((s) => s._id === res.data.subject?._id) ||
        res.data.subject;

      setDialogOpen(false);
      setNewSubject("");
      setPopularPick(null);
      if (newDoc) setSelectedSubject(newDoc);
    } catch (err: any) {
      setAddError(err.response?.data?.error || "Failed to add subject.");
    } finally {
      setAddingSubject(false);
    }
  };

  // ─── Derived ───────────────────────────────────────────────────────────────

  const currentSubtopics = [...subtopics]
    .filter((s) => s.topicTitle?.toLowerCase().trim() === selectedTopic?.topicTitle?.toLowerCase().trim())
    .sort((a, b) => a.order - b.order);

  const doneTopics     = topics.filter((t) => t.completed).length;
  const topicPct       = topics.length > 0 ? Math.round((doneTopics / topics.length) * 100) : 0;
  const doneSubtopics  = currentSubtopics.filter((s) => s.completed).length;
  const subtopicPct    = currentSubtopics.length > 0 ? Math.round((doneSubtopics / currentSubtopics.length) * 100) : 0;

  const sortedTopics   = [...topics].sort((a, b) => a.order - b.order);
  const currentTopicIdx = selectedTopic
    ? sortedTopics.findIndex((t) => t.topicTitle === selectedTopic.topicTitle)
    : -1;
  const nextTopic = currentTopicIdx >= 0 && currentTopicIdx < sortedTopics.length - 1
    ? sortedTopics[currentTopicIdx + 1]
    : null;

  const handleNextTopic = useCallback(() => {
    if (!nextTopic) return;
    handleSelectTopic(nextTopic);
  }, [nextTopic, handleSelectTopic]);

  // ─── Page loading ──────────────────────────────────────────────────────────

  if (pageLoading) {
    return (
      <Box sx={{ bgcolor: "#0a0a0a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress sx={{ color: "#4fc3f7" }} size={36} />
      </Box>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <PageBackground variant="study">
      <Container maxWidth="xl" sx={{ py: 4 }}>

        {/* ── Header ── */}
        <motion.div initial="hidden" animate="visible" variants={fade}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>
                Study Plan
              </Typography>
              <Typography variant="body2" sx={{ color: "#555", mt: 0.5 }}>
                AI-generated roadmaps · click any subtopic to load resources
              </Typography>
              {selectedSubject && topics.length > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box sx={{ width: 100 }}>
                      <LinearProgress
                        variant="determinate"
                        value={topicPct}
                        sx={{ height: 3, borderRadius: 2, bgcolor: "#1a1a1a", "& .MuiLinearProgress-bar": { bgcolor: "#4fc3f7" } }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: "#4fc3f7", minWidth: 36 }}>
                      {topicPct}%
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: "#444" }}>
                    {doneTopics}/{topics.length} topics
                  </Typography>
                </Box>
              )}
            </Box>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setDialogOpen(true)}
              sx={{
                bgcolor: "#4fc3f7", color: "#000", fontWeight: 700, px: 2.5,
                "&:hover": { bgcolor: "#29b6f6" },
              }}
            >
              Add Subject
            </Button>
          </Box>
        </motion.div>

        {/* ── Banners ── */}
        <AnimatePresence>
          {roadmapGenerating && (
            <motion.div key="rmap" variants={fade} initial="hidden" animate="visible" exit="exit">
              <Alert
                severity="info"
                icon={<Bolt sx={{ fontSize: 18 }} />}
                sx={{ mb: 2, bgcolor: "rgba(79,195,247,0.08)", color: "#4fc3f7", border: "1px solid rgba(79,195,247,0.15)", borderRadius: 2 }}
              >
                Generating AI roadmap for <strong style={{ textTransform: "capitalize" }}>{selectedSubject?.subject}</strong> — this takes a few seconds.
              </Alert>
            </motion.div>
          )}
          {resources.aiUnavailable && (
            <motion.div key="aierr" variants={fade} initial="hidden" animate="visible" exit="exit">
              <Alert
                severity="warning"
                icon={<ErrorOutline sx={{ fontSize: 18 }} />}
                sx={{ mb: 2, bgcolor: "rgba(255,183,77,0.07)", color: "#ffb74d", border: "1px solid rgba(255,183,77,0.15)", borderRadius: 2 }}
              >
                AI credits exhausted — video search unavailable. Blog resources are still loaded below. Contact admin to top up.
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 4 Column Grid ── */}
        <Grid container spacing={2} alignItems="stretch">

          {/* ── SUBJECTS ─────────────────────────────────────────────────── */}
          <Grid item xs={12} md={3}>
            <motion.div variants={stagger} initial="hidden" animate="visible" style={{ height: "100%" }}>
              <Card sx={cardSx}>
                <CardContent sx={{ p: 2.5 }}>
                  <SectionHeader label="Subjects" />

                  {subjects.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 5 }}>
                      <School sx={{ fontSize: 44, color: "#222", mb: 1.5 }} />
                      <Typography color="#444" fontSize="0.85rem" sx={{ mb: 2 }}>
                        No subjects added yet
                      </Typography>
                      <Button
                        variant="outlined" size="small" startIcon={<Add />}
                        onClick={() => setDialogOpen(true)}
                        sx={{ color: "#4fc3f7", borderColor: "#4fc3f7" }}
                      >
                        Add Subject
                      </Button>
                    </Box>
                  ) : (
                    <List dense disablePadding>
                      {subjects.map((sub) => {
                        const selected = selectedSubject?._id === sub._id;
                        return (
                          <motion.div key={sub._id} variants={fade}>
                            <ListItem
                              disablePadding
                              sx={{ mb: 0.5 }}
                              secondaryAction={
                                <Tooltip title="Delete subject" placement="right">
                                  <IconButton
                                    size="small" edge="end"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteSubject(sub._id); }}
                                    disabled={deletingId === sub._id}
                                    sx={{ color: "#333", "&:hover": { color: "#e57373" } }}
                                  >
                                    {deletingId === sub._id
                                      ? <CircularProgress size={13} />
                                      : <Delete sx={{ fontSize: 15 }} />}
                                  </IconButton>
                                </Tooltip>
                              }
                            >
                              <ListItemButton
                                onClick={() => setSelectedSubject(sub)}
                                selected={selected}
                                sx={{
                                  borderRadius: 1.5, pr: 5,
                                  "&.Mui-selected": {
                                    bgcolor: "rgba(79,195,247,0.1)",
                                    "&:hover": { bgcolor: "rgba(79,195,247,0.16)" },
                                  },
                                }}
                              >
                                <ListItemIcon sx={{ minWidth: 28 }}>
                                  <ChevronRight sx={{ fontSize: 16, color: selected ? "#4fc3f7" : "#444" }} />
                                </ListItemIcon>
                                <ListItemText
                                  primary={sub.subject}
                                  primaryTypographyProps={{
                                    sx: {
                                      textTransform: "capitalize", fontSize: "0.88rem",
                                      color: selected ? "#fff" : "#bbb", fontWeight: selected ? 600 : 400,
                                    },
                                  }}
                                />
                              </ListItemButton>
                            </ListItem>
                          </motion.div>
                        );
                      })}
                    </List>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* ── TOPICS ───────────────────────────────────────────────────── */}
          <Grid item xs={12} md={3}>
            <motion.div variants={stagger} initial="hidden" animate="visible" style={{ height: "100%" }}>
              <Card sx={cardSx}>
                <CardContent sx={{ p: 2.5, maxHeight: "74vh", overflow: "auto", ...scrollbarSx }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                    <SectionHeader label="Topics" accent="#81c784" />
                    {topics.length > 0 && (
                      <Chip
                        label={`${doneTopics}/${topics.length}`} size="small"
                        sx={{ bgcolor: "#141414", color: "#81c784", fontSize: "0.7rem", height: 20 }}
                      />
                    )}
                  </Box>

                  {roadmapGenerating ? (
                    <LoadingState label="Building roadmap…" color="#81c784" />
                  ) : topics.length === 0 ? (
                    <EmptyState label="Select a subject to view topics" />
                  ) : (
                    <>
                      <LinearProgress
                        variant="determinate" value={topicPct}
                        sx={{ height: 2, borderRadius: 2, mb: 2, bgcolor: "#1a1a1a", "& .MuiLinearProgress-bar": { bgcolor: "#81c784" } }}
                      />
                      <List dense disablePadding>
                        {[...topics].sort((a, b) => a.order - b.order).map((topic, idx) => {
                          const sel = selectedTopic?.topicTitle === topic.topicTitle;
                          return (
                            <motion.div key={topic._id || topic.topicTitle} variants={fade}>
                              <ListItem disablePadding sx={{ mb: 0.5 }}>
                                <ListItemButton
                                  onClick={() => handleSelectTopic(topic)}
                                  selected={sel}
                                  sx={{
                                    borderRadius: 1.5,
                                    "&.Mui-selected": {
                                      bgcolor: "rgba(129,199,132,0.1)",
                                      "&:hover": { bgcolor: "rgba(129,199,132,0.16)" },
                                    },
                                  }}
                                >
                                  <ListItemIcon sx={{ minWidth: 26 }}>
                                    {topic.completed
                                      ? <CheckCircle sx={{ fontSize: 15, color: "#4caf50" }} />
                                      : <RadioButtonUnchecked sx={{ fontSize: 15, color: "#333" }} />}
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={`${idx + 1}. ${topic.topicTitle}`}
                                    primaryTypographyProps={{
                                      sx: { fontSize: "0.83rem", color: sel ? "#fff" : "#aaa", fontWeight: sel ? 600 : 400 },
                                    }}
                                  />
                                </ListItemButton>
                              </ListItem>
                            </motion.div>
                          );
                        })}
                      </List>

                      {selectedTopic && !selectedTopic.completed && (
                        <Button
                          fullWidth size="small" variant="outlined"
                          startIcon={completingTopic ? <CircularProgress size={13} color="inherit" /> : <TaskAlt sx={{ fontSize: 15 }} />}
                          onClick={handleCompleteTopic}
                          disabled={completingTopic}
                          sx={{ mt: 2, color: "#81c784", borderColor: "#81c784", fontSize: "0.75rem", "&:hover": { bgcolor: "rgba(129,199,132,0.07)" } }}
                        >
                          Mark topic complete
                        </Button>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* ── SUBTOPICS ─────────────────────────────────────────────────── */}
          <Grid item xs={12} md={2}>
            <motion.div variants={stagger} initial="hidden" animate="visible" style={{ height: "100%" }}>
              <Card sx={cardSx}>
                <CardContent sx={{ p: 2.5, maxHeight: "74vh", overflow: "auto", ...scrollbarSx }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                    <SectionHeader label="Subtopics" accent="#ffb74d" />
                    {currentSubtopics.length > 0 && (
                      <Chip
                        label={`${doneSubtopics}/${currentSubtopics.length}`} size="small"
                        sx={{ bgcolor: "#141414", color: "#ffb74d", fontSize: "0.7rem", height: 20 }}
                      />
                    )}
                  </Box>

                  {!selectedTopic ? (
                    <EmptyState label="Select a topic first" />
                  ) : subtopicsLoading ? (
                    <LoadingState label="Loading subtopics…" color="#ffb74d" />
                  ) : topicFallback ? (
                    /* ── No subtopics: show fallback notice + Next Topic ── */
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, py: 2 }}>
                      <Box
                        sx={{
                          p: 1.5, borderRadius: 2,
                          bgcolor: "rgba(255,183,77,0.07)",
                          border: "1px solid rgba(255,183,77,0.15)",
                        }}
                      >
                        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                          <InfoOutlined sx={{ fontSize: 15, color: "#ffb74d", mt: 0.2, flexShrink: 0 }} />
                          <Typography fontSize="0.78rem" color="#bbb" lineHeight={1.5}>
                            No subtopics found for this topic. Resources for the full topic are shown on the right.
                          </Typography>
                        </Box>
                      </Box>

                      {/* Mark topic complete */}
                      {!selectedTopic.completed && (
                        <Button
                          fullWidth size="small" variant="outlined"
                          startIcon={completingTopic ? <CircularProgress size={13} color="inherit" /> : <TaskAlt sx={{ fontSize: 14 }} />}
                          onClick={handleCompleteTopic}
                          disabled={completingTopic}
                          sx={{ color: "#81c784", borderColor: "#81c784", fontSize: "0.75rem", "&:hover": { bgcolor: "rgba(129,199,132,0.07)" } }}
                        >
                          Mark topic complete
                        </Button>
                      )}

                      {/* Next Topic button */}
                      {nextTopic && (
                        <Button
                          fullWidth size="small" variant="contained"
                          endIcon={<ArrowForwardIos sx={{ fontSize: 12 }} />}
                          onClick={handleNextTopic}
                          sx={{
                            bgcolor: "#4fc3f7", color: "#000", fontWeight: 700, fontSize: "0.75rem",
                            "&:hover": { bgcolor: "#29b6f6" },
                          }}
                        >
                          Next: {nextTopic.topicTitle}
                        </Button>
                      )}
                      {!nextTopic && doneTopics === topics.length && topics.length > 0 && (
                        <Box sx={{ textAlign: "center", py: 1 }}>
                          <CheckCircle sx={{ fontSize: 22, color: "#4caf50", mb: 0.5 }} />
                          <Typography fontSize="0.78rem" color="#4caf50">All topics completed</Typography>
                        </Box>
                      )}
                    </Box>
                  ) : currentSubtopics.length === 0 ? (
                    <EmptyState label="No subtopics found" />
                  ) : (
                    <>
                      <LinearProgress
                        variant="determinate" value={subtopicPct}
                        sx={{ height: 2, borderRadius: 2, mb: 2, bgcolor: "#1a1a1a", "& .MuiLinearProgress-bar": { bgcolor: "#ffb74d" } }}
                      />
                      <List dense disablePadding>
                        <AnimatePresence>
                          {currentSubtopics.map((sub, idx) => {
                            const sel = selectedSubtopic?.subtopicTitle === sub.subtopicTitle;
                            return (
                              <motion.div
                                key={sub._id || sub.subtopicTitle}
                                variants={fade} initial="hidden" animate="visible" exit="exit"
                                transition={{ delay: idx * 0.04 }}
                              >
                                <ListItem disablePadding sx={{ mb: 0.5 }}>
                                  <ListItemButton
                                    onClick={() => handleSelectSubtopic(sub)}
                                    selected={sel}
                                    sx={{
                                      borderRadius: 1.5,
                                      "&.Mui-selected": {
                                        bgcolor: "rgba(255,183,77,0.1)",
                                        "&:hover": { bgcolor: "rgba(255,183,77,0.16)" },
                                      },
                                    }}
                                  >
                                    <ListItemIcon sx={{ minWidth: 24 }}>
                                      {sub.completed
                                        ? <CheckCircle sx={{ fontSize: 14, color: "#4caf50" }} />
                                        : <RadioButtonUnchecked sx={{ fontSize: 14, color: "#333" }} />}
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={sub.subtopicTitle}
                                      primaryTypographyProps={{
                                        sx: { fontSize: "0.79rem", color: sel ? "#fff" : "#999", fontWeight: sel ? 600 : 400 },
                                      }}
                                    />
                                  </ListItemButton>
                                </ListItem>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </List>

                      {selectedSubtopic && !selectedSubtopic.completed && (
                        <Button
                          fullWidth size="small" variant="outlined"
                          startIcon={completingSubtopic ? <CircularProgress size={13} color="inherit" /> : <TaskAlt sx={{ fontSize: 14 }} />}
                          onClick={handleCompleteSubtopic}
                          disabled={completingSubtopic}
                          sx={{ mt: 2, color: "#ffb74d", borderColor: "#ffb74d", fontSize: "0.72rem", "&:hover": { bgcolor: "rgba(255,183,77,0.07)" } }}
                        >
                          Mark done
                        </Button>
                      )}

                      {/* Next Topic button always visible at bottom of subtopics */}
                      {nextTopic && (
                        <Button
                          fullWidth size="small" variant="outlined"
                          endIcon={<ArrowForwardIos sx={{ fontSize: 11 }} />}
                          onClick={handleNextTopic}
                          sx={{ mt: 1, color: "#4fc3f7", borderColor: "rgba(79,195,247,0.4)", fontSize: "0.72rem", "&:hover": { bgcolor: "rgba(79,195,247,0.07)" } }}
                        >
                          Next: {nextTopic.topicTitle}
                        </Button>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* ── RESOURCES ────────────────────────────────────────────────── */}
          <Grid item xs={12} md={4}>
            <motion.div variants={stagger} initial="hidden" animate="visible" style={{ height: "100%" }}>
              <Card sx={cardSx}>
                <CardContent sx={{ p: 2.5, maxHeight: "74vh", overflow: "auto", ...scrollbarSx }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <SectionHeader label="Resources" accent="#e57373" />
                      {/* Show what we're showing resources for */}
                      {(selectedSubtopic || topicFallback) && (
                        <Typography variant="caption" sx={{ color: "#555", fontSize: "0.67rem" }}>
                          {topicFallback
                            ? `Topic: ${selectedTopic?.topicTitle}`
                            : `Subtopic: ${selectedSubtopic?.subtopicTitle}`}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {nextTopic && (
                        <Tooltip title={`Go to: ${nextTopic.topicTitle}`} placement="left">
                          <Button
                            size="small" variant="outlined"
                            endIcon={<ArrowForwardIos sx={{ fontSize: 10 }} />}
                            onClick={handleNextTopic}
                            sx={{
                              color: "#4fc3f7", borderColor: "rgba(79,195,247,0.3)",
                              fontSize: "0.68rem", py: 0.3, px: 1,
                              "&:hover": { bgcolor: "rgba(79,195,247,0.07)" },
                            }}
                          >
                            Next topic
                          </Button>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>

                  {resourcesLoading && (
                    <Box sx={{ mb: 2 }}>
                      <LinearProgress sx={{ height: 2, borderRadius: 2, bgcolor: "#1a1a1a", "& .MuiLinearProgress-bar": { bgcolor: "#e57373" } }} />
                      <Typography variant="caption" color="#444" sx={{ mt: 1, display: "block", textAlign: "center" }}>
                        Fetching resources…
                      </Typography>
                    </Box>
                  )}

                  {!resourcesLoading && !selectedSubtopic && (
                    <Box sx={{ textAlign: "center", py: 6 }}>
                      <PlayCircle sx={{ fontSize: 52, color: "#1e1e1e", mb: 1.5 }} />
                      <Typography color="#444" fontSize="0.85rem">
                        Select a subtopic to view videos and articles
                      </Typography>
                    </Box>
                  )}

                  {!resourcesLoading && selectedSubtopic && resources.videos.length === 0 && resources.blogs.length === 0 && (
                    <Box sx={{ textAlign: "center", py: 6 }}>
                      <Article sx={{ fontSize: 52, color: "#1e1e1e", mb: 1.5 }} />
                      <Typography color="#444" fontSize="0.85rem">
                        No resources found for this subtopic
                      </Typography>
                    </Box>
                  )}

                  {/* Videos */}
                  <AnimatePresence>
                    {resources.videos.length > 0 && (
                      <motion.div key="vids" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.5 }}>
                            <VideoLibrary sx={{ fontSize: 15, color: "#e57373" }} />
                            <Typography variant="caption" sx={{ color: "#e57373", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.7rem" }}>
                              Videos ({resources.videos.length})
                            </Typography>
                          </Box>
                          <Grid container spacing={1.5}>
                            {resources.videos.map((vid, idx) => (
                              <Grid item xs={12} key={idx}>
                                <motion.div variants={fade} initial="hidden" animate="visible" transition={{ delay: idx * 0.07 }}>
                                  <Card
                                    onClick={() => window.open(vid.url, "_blank")}
                                    sx={{ bgcolor: "#141414", cursor: "pointer", border: "1px solid #1e1e1e", borderRadius: 2, transition: "border-color 0.15s", "&:hover": { borderColor: "#e57373" } }}
                                  >
                                    <CardActionArea>
                                      <CardContent sx={{ display: "flex", gap: 1.5, py: "10px !important", px: "12px !important" }}>
                                        {vid.thumbnail ? (
                                          <CardMedia
                                            component="img"
                                            sx={{ width: 70, height: 50, borderRadius: 1, flexShrink: 0, objectFit: "cover" }}
                                            image={vid.thumbnail}
                                            alt={vid.title}
                                          />
                                        ) : (
                                          <Box sx={{ width: 70, height: 50, bgcolor: "#1e1e1e", borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            <PlayCircle sx={{ color: "#e57373", fontSize: 22 }} />
                                          </Box>
                                        )}
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                          <Typography
                                            variant="body2"
                                            sx={{ fontSize: "0.78rem", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.4 }}
                                          >
                                            {vid.title}
                                          </Typography>
                                          {vid.channelName && (
                                            <Chip
                                              label={vid.channelName} size="small"
                                              sx={{ mt: 0.5, bgcolor: "rgba(229,115,115,0.15)", color: "#e57373", fontSize: "0.62rem", height: 17, border: "none" }}
                                            />
                                          )}
                                        </Box>
                                      </CardContent>
                                    </CardActionArea>
                                  </Card>
                                </motion.div>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Blogs */}
                  <AnimatePresence>
                    {resources.blogs.length > 0 && (
                      <motion.div key="blogs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                        <Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.5 }}>
                            <MenuBook sx={{ fontSize: 15, color: "#64b5f6" }} />
                            <Typography variant="caption" sx={{ color: "#64b5f6", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.7rem" }}>
                              Articles ({resources.blogs.length})
                            </Typography>
                          </Box>
                          <Grid container spacing={1.5}>
                            {resources.blogs.map((blog, idx) => (
                              <Grid item xs={12} key={idx}>
                                <motion.div variants={fade} initial="hidden" animate="visible" transition={{ delay: idx * 0.06 }}>
                                  <Card
                                    onClick={() => window.open(blog.url, "_blank")}
                                    sx={{ bgcolor: "#141414", cursor: "pointer", border: "1px solid #1e1e1e", borderRadius: 2, transition: "border-color 0.15s", "&:hover": { borderColor: "#64b5f6" } }}
                                  >
                                    <CardActionArea>
                                      <CardContent sx={{ py: "10px !important", px: "12px !important" }}>
                                        <Typography variant="body2" sx={{ fontSize: "0.78rem", mb: 0.5, lineHeight: 1.4 }}>
                                          {blog.title}
                                        </Typography>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                                          <Chip
                                            label={blog.source} size="small"
                                            sx={{ bgcolor: "rgba(100,181,246,0.15)", color: "#64b5f6", fontSize: "0.62rem", height: 17, border: "none" }}
                                          />
                                          {blog.description && (
                                            <Typography variant="caption" sx={{ color: "#444", fontSize: "0.7rem" }}>
                                              {blog.description}
                                            </Typography>
                                          )}
                                        </Box>
                                      </CardContent>
                                    </CardActionArea>
                                  </Card>
                                </motion.div>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </CardContent>
              </Card>
            </motion.div>
          </Grid>

        </Grid>
      </Container>

    {/* ── Add Subject Dialog ── */}
      <Dialog
        open={dialogOpen}
        onClose={() => !addingSubject && setDialogOpen(false)}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: "#111", color: "#fff", border: "1px solid #1e1e1e", borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <School sx={{ color: "#4fc3f7", fontSize: 20 }} />
            <Typography fontWeight={700}>Add New Subject</Typography>
          </Box>
          <IconButton onClick={() => setDialogOpen(false)} disabled={addingSubject} sx={{ color: "#444" }}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="#555" sx={{ mb: 2.5 }}>
            Select a popular subject or type your own. The AI will generate a full topic roadmap.
          </Typography>

          <Autocomplete
            options={POPULAR_SUBJECTS}
            value={popularPick}
            onChange={(_, v) => { setPopularPick(v); setNewSubject(""); }}
            renderInput={(params) => (
              <TextField {...params} label="Popular subjects" sx={dialogFieldSx} />
            )}
            sx={{ mb: 2 }}
          />

          <Typography variant="caption" color="#444" sx={{ mb: 1, display: "block" }}>
            Or enter a custom subject
          </Typography>
          <TextField
            fullWidth
            value={newSubject}
            onChange={(e) => { setNewSubject(e.target.value); setPopularPick(null); }}
            onKeyDown={(e) => e.key === "Enter" && (newSubject || popularPick) && handleAddSubject()}
            placeholder="e.g., System Design, Rust, Computer Networks"
            sx={{ ...dialogFieldSx, mb: 1 }}
          />

          {addError && (
            <Alert severity="error" sx={{ mt: 1.5, bgcolor: "rgba(229,115,115,0.08)", color: "#e57373", border: "1px solid rgba(229,115,115,0.15)", borderRadius: 2 }}>
              {addError}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={addingSubject} sx={{ color: "#555" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddSubject}
            disabled={addingSubject || (!newSubject && !popularPick)}
            startIcon={addingSubject ? <CircularProgress size={15} color="inherit" /> : <Bolt sx={{ fontSize: 16 }} />}
            sx={{ bgcolor: "#4fc3f7", color: "#000", fontWeight: 700, "&:hover": { bgcolor: "#29b6f6" }, "&:disabled": { bgcolor: "#1a1a1a", color: "#444" } }}
          >
            {addingSubject ? "Generating roadmap…" : "Generate roadmap"}
          </Button>
        </DialogActions>
      </Dialog>

    </PageBackground>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function SectionHeader({ label, accent = "#4fc3f7" }: { label: string; accent?: string }) {
  return (
    <Typography variant="subtitle2" sx={{ color: accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", fontSize: "0.7rem", mb: 0 }}>
      {label}
    </Typography>
  );
}

function LoadingState({ label, color = "#4fc3f7" }: { label: string; color?: string }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 5, gap: 1.5 }}>
      <CircularProgress size={24} sx={{ color }} />
      <Typography variant="caption" sx={{ color: "#444" }}>{label}</Typography>
    </Box>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <Typography fontSize="0.82rem" color="#444" sx={{ textAlign: "center", py: 4 }}>
      {label}
    </Typography>
  );
}

// ─── Shared style objects ─────────────────────────────────────────────────────

const cardSx = {
  bgcolor: "rgba(10,10,10,0.85)",
  backdropFilter: "blur(12px)",
  border: "1px solid #1a1a1a",
  borderRadius: 2.5,
  height: "100%",
};

const scrollbarSx = {
  "&::-webkit-scrollbar": { width: 4 },
  "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
  "&::-webkit-scrollbar-thumb": { bgcolor: "#222", borderRadius: 2 },
};

const dialogFieldSx = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    "& fieldset": { borderColor: "#2a2a2a" },
    "&:hover fieldset": { borderColor: "#4fc3f7" },
    "&.Mui-focused fieldset": { borderColor: "#4fc3f7" },
  },
  "& .MuiInputLabel-root": { color: "#555" },
  "& .MuiSvgIcon-root": { color: "#555" },
};
