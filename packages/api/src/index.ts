import app from './server';

const PORT = process.env.API_PORT || 3000;

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});