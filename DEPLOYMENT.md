# Deployment Guide

## Environment Variables

### Frontend (Vite)
Set these environment variables in your frontend deployment:

```env
VITE_API_URL=https://nxt-round.onrender.com/api
```

The WebSocket URL will be automatically derived from the API URL.

### Backend (Render)
Set these environment variables in your Render deployment:

```env
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=https://nxtround.tech
```

## WebSocket Connection Issues

If you're experiencing WebSocket connection failures:

1. **Check CORS Configuration**: Ensure the frontend domain is included in the CORS allowed origins
2. **Verify Environment Variables**: Make sure `VITE_API_URL` is set correctly
3. **Check Network**: Ensure the backend server is accessible from the frontend
4. **Monitor Logs**: Check server logs for connection errors

## Performance Optimizations

- Added connection retry logic with exponential backoff
- Implemented proper timeout handling
- Added loading states to prevent premature rendering
- Configured server-side Socket.io with proper ping intervals

## Troubleshooting

### WebSocket Connection Failed
- Check if the backend server is running
- Verify the WebSocket URL is correct
- Check browser console for CORS errors
- Ensure the server's CORS configuration includes your frontend domain

### Slow Loading Times
- Check database connection performance
- Monitor server response times
- Verify network connectivity
- Check for large payload sizes 