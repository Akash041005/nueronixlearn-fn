import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, CardContent, Button,
  Chip, LinearProgress, IconButton, List, ListItem,
  ListItemIcon, ListItemText, Tabs, Tab, Grid, Paper, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem
} from '@mui/material';
import {
  CheckCircle, RadioButtonUnchecked, YouTube, PlayArrow,
  Delete, Refresh, School, Add, OpenInNew, CloudUpload
} from '@mui/icons-material';
import { chatbotAPI } from '../services/api';
import PDFUploadDialog from '../components/PDFUpload';
import SEO from '../components/SEO';

const COMMON_SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'English', 'History', 'Computer Science', 'Geography',
  'Economics', 'Commerce', 'Custom'
];

const COMMON_TOPICS: Record<string, string[]> = {
  'Mathematics': ['Algebra', 'Calculus', 'Geometry', 'Trigonometry', 'Statistics', 'Probability'],
  'Physics': ['Mechanics', 'Thermodynamics', 'Waves', 'Optics', 'Electromagnetism'],
  'Chemistry': ['Atomic Structure', 'Chemical Bonding', 'Organic Chemistry', 'Thermodynamics'],
  'Biology': ['Cell Biology', 'Genetics', 'Ecology', 'Human Anatomy', 'Plant Biology'],
  'English': ['Grammar', 'Vocabulary', 'Reading Comprehension', 'Writing'],
  'Computer Science': ['Programming', 'Data Structures', 'Algorithms', 'Web Development', 'Databases'],
};

interface WeakTopic {
  _id: string;
  topicName: string;
  subject: string;
  completed: boolean;
  createdAt: string;
}

interface Todo {
  _id: string;
  subject: string;
  topicName: string;
  completed: boolean;
  order: number;
}

interface Video {
  videoId?: string;
  title: string;
  channelName?: string;
  duration?: string;
  url?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function StudyPlan() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [nextVideo, setNextVideo] = useState<{ topic: WeakTopic; videos: Video[] } | null>(null);
  const [selectedTopicVideos, setSelectedTopicVideos] = useState<Video[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  
  // Add topic dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [topicsRes, todosRes, nextVideoRes] = await Promise.all([
        chatbotAPI.getWeakTopics(),
        chatbotAPI.getTodos(),
        chatbotAPI.getNextVideo()
      ]);
      setWeakTopics(topicsRes.data.topics || []);
      setTodos(todosRes.data.todos || []);
      if (nextVideoRes.data.topic) {
        setNextVideo({
          topic: nextVideoRes.data.topic,
          videos: nextVideoRes.data.videos || []
        });
      }
    } catch (err) {
      console.error('Failed to fetch study data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTopic = async (id: string, completed: boolean) => {
    try {
      await chatbotAPI.updateWeakTopic(id, !completed);
      setWeakTopics(prev => prev.map(t => 
        t._id === id ? { ...t, completed: !completed } : t
      ));
    } catch (err) {
      console.error('Failed to update topic:', err);
    }
  };

  const handleDeleteTopic = async (id: string) => {
    try {
      await chatbotAPI.deleteWeakTopic(id);
      setWeakTopics(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      console.error('Failed to delete topic:', err);
    }
  };

  const handleCompleteTodo = async (id: string) => {
    try {
      await chatbotAPI.completeTodo(id);
      setTodos(prev => prev.map(t => 
        t._id === id ? { ...t, completed: true } : t
      ));
    } catch (err) {
      console.error('Failed to complete todo:', err);
    }
  };

  const handleGetVideos = async (topicId: string) => {
    try {
      const res = await chatbotAPI.getWeakTopicVideos(topicId);
      setSelectedTopicVideos(res.data.videos || []);
      setSelectedTopicId(topicId);
    } catch (err) {
      console.error('Failed to get videos:', err);
    }
  };

  const handleAddTopic = async () => {
    if (!newTopic.trim() || !newSubject.trim()) return;
    
    setAdding(true);
    try {
      const topicToAdd = customTopic.trim() || newTopic;
      await chatbotAPI.addWeakTopic(topicToAdd, newSubject);
      setAddDialogOpen(false);
      setNewSubject('');
      setNewTopic('');
      setCustomTopic('');
      fetchData();
    } catch (err) {
      console.error('Failed to add topic:', err);
    } finally {
      setAdding(false);
    }
  };

  const handleOpenAddDialog = () => {
    setAddDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
    setNewSubject('');
    setNewTopic('');
    setCustomTopic('');
  };

  const handleOpenVideo = (video: Video) => {
    console.log('Opening video:', video);
    if (video.url) {
      window.open(video.url, '_blank');
    } else if (video.videoId && video.videoId !== 'VIDEO_ID') {
      window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank');
    } else {
      // Search on YouTube if no valid video
      const searchQuery = `${video.title} tutorial`;
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`, '_blank');
    }
  };

  const completedCount = weakTopics.filter(t => t.completed).length;
  const progress = weakTopics.length > 0 ? (completedCount / weakTopics.length) * 100 : 0;

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SEO 
        title="My Study Plan"
        description="View your personalized AI study plan with weak topics, recommended videos, and todo tracking."
        url="/study-plan"
      />
      <Typography variant="h4" fontWeight={700} gutterBottom>
        My Study Plan
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Weak Areas Progress
                </Typography>
                <Chip 
                  label={`${completedCount}/${weakTopics.length} Completed`}
                  color="primary"
                  size="small"
                />
              </Box>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
            </CardContent>
          </Card>

            <Paper sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, pb: 0 }}>
              <Tabs 
                value={tab} 
                onChange={(_, v) => setTab(v)}
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label="Weak Topics" />
                <Tab label="Study Todos" />
              </Tabs>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={handleOpenAddDialog}
                size="small"
              >
                Add Topic
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<CloudUpload />}
                onClick={() => setPdfDialogOpen(true)}
                size="small"
                sx={{ ml: 1 }}
              >
                Upload PDF
              </Button>
            </Box>

            <TabPanel value={tab} index={0}>
              {weakTopics.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <School sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary" paragraph>
                    No weak topics yet. Add topics you're struggling with!
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    onClick={handleOpenAddDialog}
                  >
                    Add Your First Topic
                  </Button>
                </Box>
              ) : (
                <List>
                  {weakTopics.map((topic) => (
                    <ListItem 
                      key={topic._id}
                      sx={{ 
                        bgcolor: topic.completed ? 'action.hover' : 'transparent',
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      <ListItemIcon>
                        <IconButton onClick={() => handleToggleTopic(topic._id, topic.completed)}>
                          {topic.completed ? 
                            <CheckCircle color="success" /> : 
                            <RadioButtonUnchecked />
                          }
                        </IconButton>
                      </ListItemIcon>
                      <ListItemText 
                        primary={topic.topicName}
                        secondary={topic.subject}
                        primaryTypographyProps={{
                          sx: { textDecoration: topic.completed ? 'line-through' : 'none' }
                        }}
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          size="small" 
                          startIcon={<YouTube />}
                          onClick={() => handleGetVideos(topic._id)}
                        >
                          Videos
                        </Button>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteTopic(topic._id)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </TabPanel>

            <TabPanel value={tab} index={1}>
              {todos.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <CheckCircle sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary">
                    No study todos yet. Add weak topics to generate a study plan!
                  </Typography>
                </Box>
              ) : (
                <List>
                  {todos.sort((a, b) => a.order - b.order).map((todo) => (
                    <ListItem 
                      key={todo._id}
                      sx={{ 
                        bgcolor: todo.completed ? 'action.hover' : 'transparent',
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      <ListItemIcon>
                        <IconButton 
                          onClick={() => !todo.completed && handleCompleteTodo(todo._id)}
                          disabled={todo.completed}
                        >
                          {todo.completed ? 
                            <CheckCircle color="success" /> : 
                            <RadioButtonUnchecked />
                          }
                        </IconButton>
                      </ListItemIcon>
                      <ListItemText 
                        primary={todo.topicName}
                        secondary={todo.subject}
                        primaryTypographyProps={{
                          sx: { textDecoration: todo.completed ? 'line-through' : 'none' }
                        }}
                      />
                      <Chip 
                        label={`#${todo.order}`} 
                        size="small" 
                        variant="outlined"
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </TabPanel>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          {nextVideo && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PlayArrow color="error" />
                  <Typography variant="h6">
                    Up Next
                  </Typography>
                </Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {nextVideo.topic.topicName}
                </Typography>
                <Chip 
                  label={nextVideo.topic.subject} 
                  size="small" 
                  sx={{ mb: 2 }}
                />
                <Divider sx={{ my: 2 }} />
                {nextVideo.videos.length > 0 ? (
                  nextVideo.videos.slice(0, 3).map((video, idx) => (
                    <Box 
                      key={idx}
                      onClick={() => handleOpenVideo(video)}
                      sx={{ 
                        p: 1.5, 
                        mb: 1, 
                        borderRadius: 1,
                        bgcolor: 'grey.100',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'grey.200' }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <YouTube color="error" fontSize="small" />
                        <Typography variant="body2" fontWeight={500} noWrap>
                          {video.title}
                        </Typography>
                        <OpenInNew fontSize="small" sx={{ ml: 'auto', fontSize: 14 }} />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, ml: 4 }}>
                        <Typography variant="caption" color="text.secondary">
                          {video.channelName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {video.duration}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No videos available for this topic yet.
                  </Typography>
                )}
                <Button 
                  fullWidth 
                  variant="contained" 
                  sx={{ mt: 2 }}
                  onClick={fetchData}
                  startIcon={<Refresh />}
                >
                  Refresh
                </Button>
              </CardContent>
            </Card>
          )}

          {selectedTopicVideos.length > 0 && selectedTopicId && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Videos for this Topic
                </Typography>
                {selectedTopicVideos.map((video, idx) => (
                  <Box 
                    key={idx}
                    onClick={() => handleOpenVideo(video)}
                    sx={{ 
                      p: 1.5, 
                      mb: 1, 
                      borderRadius: 1,
                      bgcolor: 'grey.100',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'grey.200' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <YouTube color="error" fontSize="small" />
                      <Typography variant="body2" fontWeight={500}>
                        {video.title}
                      </Typography>
                      <OpenInNew fontSize="small" sx={{ ml: 'auto', fontSize: 14 }} />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                      {video.channelName} • {video.duration}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* PDF Upload Dialog */}
      <PDFUploadDialog 
        open={pdfDialogOpen} 
        onClose={() => setPdfDialogOpen(false)} 
        onSuccess={fetchData}
      />

      {/* Add Topic Dialog */}
      <Dialog open={addDialogOpen} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Weak Topic</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add a topic you're struggling with. We'll create a study plan for you.
          </Typography>
          
          <TextField
            select
            fullWidth
            label="Subject"
            value={newSubject}
            onChange={(e) => {
              setNewSubject(e.target.value);
              setNewTopic('');
            }}
            sx={{ mb: 2 }}
          >
            {COMMON_SUBJECTS.map((subject) => (
              <MenuItem key={subject} value={subject}>
                {subject === 'Custom' ? 'Custom Subject...' : subject}
              </MenuItem>
            ))}
          </TextField>

          {newSubject === 'Custom' && (
            <TextField
              fullWidth
              label="Enter Subject Name"
              placeholder="e.g., Data Science"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              sx={{ mb: 2 }}
            />
          )}

          {newSubject && newSubject !== 'Custom' && COMMON_TOPICS[newSubject] && (
            <TextField
              select
              fullWidth
              label="Topic"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              sx={{ mb: 2 }}
            >
              {COMMON_TOPICS[newSubject].map((topic) => (
                <MenuItem key={topic} value={topic}>
                  {topic}
                </MenuItem>
              ))}
              <MenuItem value="__custom__">Custom Topic...</MenuItem>
            </TextField>
          )}

          {newSubject && newSubject !== 'Custom' && (!COMMON_TOPICS[newSubject] || newTopic === '__custom__') && (
            <TextField
              fullWidth
              label="Custom Topic"
              placeholder="Enter your topic"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              sx={{ mb: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button 
            onClick={handleAddTopic} 
            variant="contained"
            disabled={(!newTopic && !customTopic) || !newSubject || adding}
          >
            {adding ? 'Adding...' : 'Add Topic'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
