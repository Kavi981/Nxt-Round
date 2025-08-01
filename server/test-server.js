import express from 'express';
import { createServer } from 'http';

const app = express();
const server = createServer(app);

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/api/auth/forgot-password', (req, res) => {
  console.log('Forgot password request:', req.body);
  res.json({ 
    message: 'OTP sent to your email',
    resetToken: 'test-token-123'
  });
});

const PORT = 5003;

server.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
}); 