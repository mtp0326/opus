import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import Navigation from '../components/Navigation';
import { getData, postData } from '../util/api.tsx';

interface LabelProject {
  _id: string;
  title: string;
  description: string;
  labelStudioProjectId: string;
  config: string;
  createdAt: string;
  status: 'active' | 'completed';
}

function LabelData() {
  const { surveyId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<LabelProject[]>([]);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    config: '',
  });
  const [creatingProject, setCreatingProject] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getData(`surveys/${surveyId}/label-projects`);
        if (response.error) {
          throw new Error(response.error.message);
        }
        setProjects(response.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch label projects',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [surveyId]);

  const handleCreateProject = async () => {
    if (!newProject.title || !newProject.config) return;

    setCreatingProject(true);
    try {
      const response = await postData(`surveys/${surveyId}/label-projects`, {
        ...newProject,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setProjects([...projects, response.data]);
      setNewProject({ title: '', description: '', config: '' });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create label project',
      );
    } finally {
      setCreatingProject(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <Container>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
          >
            <CircularProgress />
          </Box>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <Container>
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <Container>
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h4" gutterBottom>
            Label Studio Projects
          </Typography>

          {/* Create New Project Form */}
          <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
            <Typography variant="h6" gutterBottom>
              Create New Label Project
            </Typography>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Project Title"
                value={newProject.title}
                onChange={(e) =>
                  setNewProject({ ...newProject, title: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={newProject.description}
                onChange={(e) =>
                  setNewProject({ ...newProject, description: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Label Studio Configuration"
                multiline
                rows={4}
                value={newProject.config}
                onChange={(e) =>
                  setNewProject({ ...newProject, config: e.target.value })
                }
                helperText="Enter Label Studio compatible JSON configuration"
              />
              <Button
                variant="contained"
                startIcon={<PlaylistAddIcon />}
                onClick={handleCreateProject}
                disabled={
                  creatingProject || !newProject.title || !newProject.config
                }
              >
                Create Label Project
              </Button>
            </Stack>
          </Paper>

          {/* Existing Projects List */}
          {projects.length > 0 ? (
            projects.map((project) => (
              <Paper key={project._id} sx={{ p: 3, mb: 2 }}>
                <Typography variant="h6">{project.title}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {project.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    href={`/label-studio/${project.labelStudioProjectId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open in Label Studio
                  </Button>
                </Box>
              </Paper>
            ))
          ) : (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
              No label projects created yet
            </Typography>
          )}
        </Paper>
      </Container>
    </>
  );
}

export default LabelData;
