import { useState } from 'react';
import { 
  Box, Container, Typography, Card, CardContent, Grid, TextField, 
  Button, FormControl, InputLabel, Select, MenuItem, Chip, OutlinedInput,
  CircularProgress, LinearProgress, Stepper, Step, StepLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const subjectOptions = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
  'English', 'History', 'Geography', 'Economics', 'Business Studies',
  'Accounting', 'Psychology', 'Philosophy', 'Art', 'Music'
];

const goalOptions = [
  { value: 'board_exams', label: 'Board Exams' },
  { value: 'jee', label: 'JEE Preparation' },
  { value: 'neet', label: 'NEET Preparation' },
  { value: 'certification', label: 'Professional Certification' },
  { value: 'skill_improvement', label: 'Skill Improvement' },
  { value: 'knowledge_exploration', label: 'Knowledge Exploration' },
  { value: 'career', label: 'Career Advancement' }
];

const steps = ['Basic Info', 'Learning Preferences', 'Goals & Assessment'];

const Onboarding = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    grade: '',
    subjectInterests: [] as string[],
    weakAreas: [] as string[],
    preferredLearningStyle: 'mixed',
    learningGoals: [] as string[],
    currentPerformanceLevel: 'average',
    pacePreference: 'medium',
    languagePreference: 'en',
    targetExamDate: ''
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      setLoading(true);
      try {
        await authAPI.completeOnboarding({
          ...formData,
          targetExamDate: formData.targetExamDate || undefined
        });
        navigate('/dashboard');
      } catch (error) {
        console.error('Onboarding error:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa', py: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>
          Welcome to NeuroLearn
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
          Let's personalize your learning experience
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Card>
          <CardContent sx={{ p: 4 }}>
            {loading && <LinearProgress sx={{ mb: 3 }} />}
            
            {activeStep === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Tell us about yourself</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Grade/Class"
                    value={formData.grade}
                    onChange={(e) => handleChange('grade', e.target.value)}
                    placeholder="e.g., Class 10, Grade 12"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Performance Level</InputLabel>
                    <Select
                      value={formData.currentPerformanceLevel}
                      label="Performance Level"
                      onChange={(e) => handleChange('currentPerformanceLevel', e.target.value)}
                    >
                      <MenuItem value="below_average">Below Average</MenuItem>
                      <MenuItem value="average">Average</MenuItem>
                      <MenuItem value="above_average">Above Average</MenuItem>
                      <MenuItem value="excellent">Excellent</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Subjects You're Interested In</InputLabel>
                    <Select
                      multiple
                      value={formData.subjectInterests}
                      onChange={(e) => handleChange('subjectInterests', e.target.value)}
                      input={<OutlinedInput label="Subjects You're Interested In" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {subjectOptions.map((subject) => (
                        <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Subjects You Find Difficult</InputLabel>
                    <Select
                      multiple
                      value={formData.weakAreas}
                      onChange={(e) => handleChange('weakAreas', e.target.value)}
                      input={<OutlinedInput label="Subjects You Find Difficult" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" color="warning" />
                          ))}
                        </Box>
                      )}
                    >
                      {subjectOptions.map((subject) => (
                        <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}

            {activeStep === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>How do you prefer to learn?</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Preferred Learning Style</InputLabel>
                    <Select
                      value={formData.preferredLearningStyle}
                      label="Preferred Learning Style"
                      onChange={(e) => handleChange('preferredLearningStyle', e.target.value)}
                    >
                      <MenuItem value="video">Video Lectures</MenuItem>
                      <MenuItem value="text">Reading Materials</MenuItem>
                      <MenuItem value="practice">Practice Exercises</MenuItem>
                      <MenuItem value="interactive">Interactive Content</MenuItem>
                      <MenuItem value="mixed">Mix of Everything</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Learning Pace</InputLabel>
                    <Select
                      value={formData.pacePreference}
                      label="Learning Pace"
                      onChange={(e) => handleChange('pacePreference', e.target.value)}
                    >
                      <MenuItem value="slow">Slow - Take your time</MenuItem>
                      <MenuItem value="medium">Medium - Comfortable pace</MenuItem>
                      <MenuItem value="fast">Fast - Quick learner</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}

            {activeStep === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>What are your learning goals?</Typography>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Learning Goals</InputLabel>
                    <Select
                      multiple
                      value={formData.learningGoals}
                      onChange={(e) => handleChange('learningGoals', e.target.value)}
                      input={<OutlinedInput label="Learning Goals" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip 
                              key={value} 
                              label={goalOptions.find(g => g.value === value)?.label || value} 
                              size="small" 
                              color="primary"
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {goalOptions.map((goal) => (
                        <MenuItem key={goal.value} value={goal.value}>{goal.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Target Exam Date (Optional)"
                    type="date"
                    value={formData.targetExamDate}
                    onChange={(e) => handleChange('targetExamDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button 
                disabled={activeStep === 0 || loading} 
                onClick={handleBack}
              >
                Back
              </Button>
              <Button 
                variant="contained" 
                onClick={handleNext}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : activeStep === steps.length - 1 ? 'Complete' : 'Next'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Onboarding;
